import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { PetsModule } from './pets/pets.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { ProductsModule } from './products/products.module';
import { SalesModule } from './sales/sales.module';
import { PlansModule } from './plans/plans.module';
import { ClinicalRecordsModule } from './clinical-records/clinical-records.module';
import { LaboratoryExamsModule } from './laboratory-exams/laboratory-exams.module';
import { DietaryPlansModule } from './dietary-plans/dietary-plans.module';
import { EducationalMaterialsModule } from './educational-materials/educational-materials.module';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationsModule } from './notifications/notifications.module';
import { ClinicsModule } from './clinics/clinics.module';
import { AdminModule } from './admin/admin.module';
import { AppointmentRequestsModule } from './appointment-requests/appointment-requests.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuthModule,
    AdminModule,
    ClinicsModule,
    UsersModule,
    ClientsModule,
    PetsModule,
    AppointmentsModule,
    PrescriptionsModule,
    ProductsModule,
    SalesModule,
    PlansModule,
    ClinicalRecordsModule,
    LaboratoryExamsModule,
    DietaryPlansModule,
    EducationalMaterialsModule,
    NotificationsModule,
    AppointmentRequestsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
