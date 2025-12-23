import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Credit } from '../modules/credit/entities/credit.entity';
import { User } from '../modules/auth/entities/user.entity';
import { CreditStatus } from '../modules/credit/schemas/credit-improved.schema';

/**
 * Script de migración para actualizar datos existentes al nuevo sistema de analistas
 * 
 * Ejecutar con: npm run migration:analyst-system
 */
async function bootstrap() {
  console.log('🚀 Iniciando migración al sistema de analistas...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  
  const creditModel = app.get<Model<Credit>>(getModelToken(Credit.name));
  const userModel = app.get<Model<User>>(getModelToken(User.name));

  try {
    // 1. Migrar usuarios con roles obsoletos
    console.log('📋 Paso 1: Migrando roles de usuarios...');
    
    // Usuarios con rol "approver" → "analyst1" (o distribuir entre analyst1, analyst2, analyst3)
    const approvers = await userModel.find({ roles: { $in: ['approver'] } });
    console.log(`   Encontrados ${approvers.length} usuarios con rol 'approver'`);
    
    let analystCounter = 1;
    for (const user of approvers) {
      // Distribuir equitativamente entre los 3 analistas
      const newRole = `analyst${analystCounter}`;
      
      const updatedRoles = user.roles
        .filter(role => role !== 'approver')
        .concat(newRole);
      
      await userModel.updateOne(
        { _id: user._id },
        { $set: { roles: updatedRoles } }
      );
      
      console.log(`   ✓ Usuario ${user.email}: approver → ${newRole}`);
      
      analystCounter = (analystCounter % 3) + 1; // Rotar entre 1, 2, 3
    }

    // Usuarios con rol "disburser" → "analyst3" (ya que analyst3 maneja desembolso)
    const disbursers = await userModel.find({ roles: { $in: ['disburser'] } });
    console.log(`   Encontrados ${disbursers.length} usuarios con rol 'disburser'`);
    
    for (const user of disbursers) {
      const updatedRoles = user.roles
        .filter(role => role !== 'disburser')
        .concat('analyst3');
      
      await userModel.updateOne(
        { _id: user._id },
        { $set: { roles: updatedRoles } }
      );
      
      console.log(`   ✓ Usuario ${user.email}: disburser → analyst3`);
    }

    // 2. Migrar estados de créditos
    console.log('\n📋 Paso 2: Migrando estados de créditos...');
    
    // Créditos en estado "pending" → "SUBMITTED" (radicados)
    const pendingCredits = await creditModel.find({ status: 'pending' });
    console.log(`   Encontrados ${pendingCredits.length} créditos en estado 'pending'`);
    
    for (const credit of pendingCredits) {
      await creditModel.updateOne(
        { _id: credit._id },
        { 
          $set: { 
            status: CreditStatus.SUBMITTED,
            radicationDate: credit.radicationDate || credit.created || new Date(),
          },
          $push: {
            statusHistory: {
              status: CreditStatus.SUBMITTED,
              changedAt: new Date(),
              changedBy: 'migration-script',
              reason: 'Migración de pending a SUBMITTED',
            },
          },
        }
      );
    }
    console.log(`   ✓ Migrados ${pendingCredits.length} créditos: pending → SUBMITTED`);

    // Créditos en estado "approved" → "ANALYST3_APPROVED" (pre-aprobados)
    const approvedCredits = await creditModel.find({ status: 'approved' });
    console.log(`   Encontrados ${approvedCredits.length} créditos en estado 'approved'`);
    
    for (const credit of approvedCredits) {
      await creditModel.updateOne(
        { _id: credit._id },
        { 
          $set: { 
            status: CreditStatus.ANALYST3_APPROVED,
            analyst1Notes: 'Aprobado en sistema anterior',
            analyst2Notes: 'Aprobado en sistema anterior',
            analyst3Notes: 'Pre-aprobado en sistema anterior',
          },
          $push: {
            statusHistory: {
              status: CreditStatus.ANALYST3_APPROVED,
              changedAt: new Date(),
              changedBy: 'migration-script',
              reason: 'Migración de approved a ANALYST3_APPROVED',
            },
          },
        }
      );
    }
    console.log(`   ✓ Migrados ${approvedCredits.length} créditos: approved → ANALYST3_APPROVED`);

    // Créditos en estado "rejected" → "REJECTED" (mantener)
    const rejectedCredits = await creditModel.find({ status: 'rejected' });
    console.log(`   Encontrados ${rejectedCredits.length} créditos en estado 'rejected'`);
    
    if (rejectedCredits.length > 0) {
      await creditModel.updateMany(
        { status: 'rejected' },
        { 
          $set: { status: CreditStatus.REJECTED },
          $push: {
            statusHistory: {
              status: CreditStatus.REJECTED,
              changedAt: new Date(),
              changedBy: 'migration-script',
              reason: 'Migración a nuevo sistema',
            },
          },
        }
      );
      console.log(`   ✓ Actualizados ${rejectedCredits.length} créditos rechazados`);
    }

    // Créditos en estado "disbursed" → "DISBURSED" (mantener)
    const disbursedCredits = await creditModel.find({ status: 'disbursed' });
    console.log(`   Encontrados ${disbursedCredits.length} créditos en estado 'disbursed'`);
    
    if (disbursedCredits.length > 0) {
      await creditModel.updateMany(
        { status: 'disbursed' },
        { 
          $set: { status: CreditStatus.DISBURSED },
          $push: {
            statusHistory: {
              status: CreditStatus.DISBURSED,
              changedAt: new Date(),
              changedBy: 'migration-script',
              reason: 'Migración a nuevo sistema',
            },
          },
        }
      );
      console.log(`   ✓ Actualizados ${disbursedCredits.length} créditos desembolsados`);
    }

    // 3. Resumen de migración
    console.log('\n📊 Resumen de migración:');
    console.log('========================');
    
    const totalUsers = approvers.length + disbursers.length;
    const totalCredits = pendingCredits.length + approvedCredits.length + rejectedCredits.length + disbursedCredits.length;
    
    console.log(`✓ ${totalUsers} usuarios migrados`);
    console.log(`✓ ${totalCredits} créditos migrados`);
    
    console.log('\n🎉 Migración completada exitosamente!\n');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await app.close();
  }
}

// Ejecutar migración
bootstrap()
  .then(() => {
    console.log('Script finalizado correctamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });

