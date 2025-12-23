import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Credit } from '../modules/credit/entities/credit.entity';
import { CreditStatus } from '../modules/credit/interfaces';

async function fixRadicatedCredits() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const creditModel = app.get<Model<Credit>>(getModelToken(Credit.name));

  console.log('🔍 Buscando créditos radicados desde COMMERCIAL...');

  // Buscar créditos radicados desde el módulo comercial
  const radicatedCredits = await creditModel.find({
    radicationSource: 'COMMERCIAL',
  }).exec();

  console.log(`📊 Encontrados ${radicatedCredits.length} créditos radicados desde COMMERCIAL`);

  if (radicatedCredits.length === 0) {
    console.log('✅ No hay créditos para actualizar');
    await app.close();
    return;
  }

  // Mostrar detalles de los créditos encontrados
  console.log('\n📋 Créditos encontrados:');
  radicatedCredits.forEach((credit, index) => {
    console.log(`${index + 1}. ID: ${credit._id}`);
    console.log(`   Nombre: ${credit.name} ${credit.lastname}`);
    console.log(`   Documento: ${credit.documentNumber}`);
    console.log(`   Estado actual: ${credit.status}`);
    console.log(`   Fecha radicación: ${credit.radicationDate || 'N/A'}`);
    console.log('');
  });

  // Actualizar créditos que NO están en estado SUBMITTED
  const creditsToUpdate = radicatedCredits.filter(
    (credit) => credit.status !== CreditStatus.SUBMITTED
  );

  if (creditsToUpdate.length === 0) {
    console.log('✅ Todos los créditos ya tienen el estado correcto (SUBMITTED)');
    await app.close();
    return;
  }

  console.log(`\n🔧 Actualizando ${creditsToUpdate.length} créditos a estado SUBMITTED...`);

  for (const credit of creditsToUpdate) {
    await creditModel.findByIdAndUpdate(credit._id, {
      status: CreditStatus.SUBMITTED,
      $push: {
        statusHistory: {
          status: CreditStatus.SUBMITTED,
          changedAt: new Date(),
          changedBy: 'system',
          reason: 'Actualización automática de créditos radicados',
        },
      },
    });
    console.log(`✅ Actualizado: ${credit.name} ${credit.lastname} (${credit._id})`);
  }

  console.log('\n✅ Proceso completado!');
  console.log(`📊 Total actualizados: ${creditsToUpdate.length}`);

  // Verificar créditos después de la actualización
  const verifyCredits = await creditModel.find({
    radicationSource: 'COMMERCIAL',
    status: CreditStatus.SUBMITTED,
  }).exec();

  console.log(`\n✅ Verificación: ${verifyCredits.length} créditos con estado SUBMITTED`);

  await app.close();
}

fixRadicatedCredits()
  .then(() => {
    console.log('\n🎉 Script ejecutado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error ejecutando script:', error);
    process.exit(1);
  });

