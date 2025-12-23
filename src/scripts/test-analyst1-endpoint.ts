import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Credit } from '../modules/credit/entities/credit.entity';
import { CreditStatus } from '../modules/credit/interfaces';

async function testAnalyst1Endpoint() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const creditModel = app.get<Model<Credit>>(getModelToken(Credit.name));

  console.log('🧪 Probando query del Analista 1...\n');

  // Esta es la misma query que usa el AnalystService
  const statusMap = {
    1: [CreditStatus.SUBMITTED, CreditStatus.ANALYST1_REVIEW],
  };

  const query = {
    status: { $in: statusMap[1] },
  };

  console.log('📋 Query que se ejecuta:');
  console.log(JSON.stringify(query, null, 2));
  console.log('');

  const credits = await creditModel
    .find(query)
    .sort({ created: -1 })
    .exec();

  console.log(`📊 Créditos encontrados: ${credits.length}\n`);

  if (credits.length > 0) {
    console.log('✅ Lista de créditos:');
    credits.forEach((credit, index) => {
      console.log(`\n${index + 1}. ${credit.name} ${credit.lastname}`);
      console.log(`   ID: ${credit._id}`);
      console.log(`   Documento: ${credit.documentNumber}`);
      console.log(`   Estado: ${credit.status}`);
      console.log(`   Monto: $${credit.amount?.toLocaleString('es-CO')}`);
      console.log(`   Radicado desde: ${credit.radicationSource}`);
      console.log(`   Fecha: ${credit.radicationDate || credit.created}`);
    });
  } else {
    console.log('❌ No se encontraron créditos para Analista 1');
    console.log('\n🔍 Verificando todos los créditos en la BD...');
    
    const allCredits = await creditModel.find({}).exec();
    console.log(`Total créditos en BD: ${allCredits.length}`);
    
    if (allCredits.length > 0) {
      console.log('\n📋 Estados de los créditos:');
      allCredits.forEach((credit, index) => {
        console.log(`${index + 1}. ${credit.name} - Estado: ${credit.status}`);
      });
    }
  }

  console.log('\n✅ Prueba completada');
  await app.close();
}

testAnalyst1Endpoint()
  .then(() => {
    console.log('\n🎉 Script ejecutado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error ejecutando script:', error);
    process.exit(1);
  });

