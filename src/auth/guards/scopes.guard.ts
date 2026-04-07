import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { SCOPES_KEY } from '../decorators/require-scopes.decorator';

@Injectable()
export class ScopesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredScopes =
      this.reflector.get<string[]>(SCOPES_KEY, context.getHandler()) || [];
    if (requiredScopes.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user) return false;

    // Admin bypass
    if (user.role === 'ADMIN') return true;

    // If any scope passes, allow (OR semantics)
    for (const scope of requiredScopes) {
      if (scope === 'VET' && user.role === 'VET') return true;
      if (scope === 'CLIENT' && user.role === 'CLIENT') return true;

      // Handle resource ownership checks like "appointments:own", "plans:own", "prescriptions:own", "clinical-records:own"
      if (scope.endsWith(':own')) {
        const resource = scope.split(':')[0]; // e.g. 'appointments' or 'plans'
        // collect possible id candidates from params/body
        const id =
          req.params?.id ??
          req.params?.[`${resource.slice(0, -1)}Id`] ??
          req.params?.petId ??
          req.body?.id ??
          req.body?.appointmentId ??
          req.body?.petId;
        if (!id) continue;

        // Specific resource handling
        if (resource === 'appointments') {
          const appt = await this.prisma.appointment.findUnique({
            where: { id },
            include: { pet: { include: { client: true } }, vet: true },
          });
          if (!appt) continue;

          // Client owner
          if (user.role === 'CLIENT' && appt.pet?.client?.userId === user.id)
            return true;

          // Vet ownership or clinic membership
          if (user.role === 'VET') {
            const vet = await this.prisma.vet.findUnique({
              where: { userId: user.id },
            });
            if (!vet) continue;
            if (vet.id === appt.vetId) return true;
            if (appt.vetId === null) return true;
            if (
              vet.clinicId &&
              appt.vet &&
              appt.vet.clinicId &&
              vet.clinicId === appt.vet.clinicId
            )
              return true;
          }
        }


        if (resource === 'prescriptions') {
          const presc = await this.prisma.prescription.findUnique({
            where: { id },
            include: { pet: { include: { client: true } }, vet: true },
          });
          if (!presc) continue;
          if (user.role === 'CLIENT' && presc.pet?.client?.userId === user.id)
            return true;
          if (user.role === 'VET') {
            const vet = await this.prisma.vet.findUnique({
              where: { userId: user.id },
            });
            if (!vet) continue;
            if (vet.id === presc.vetId) return true;
            if (
              vet.clinicId &&
              presc.vet &&
              presc.vet.clinicId &&
              vet.clinicId === presc.vet.clinicId
            )
              return true;
          }
        }

        if (resource === 'clinical-records') {
          const record = await this.prisma.clinicalRecord.findUnique({
            where: { id },
            include: {
              pet: { include: { client: true } },
              appointment: { include: { vet: true } },
            },
          });
          if (!record) continue;
          if (user.role === 'CLIENT' && record.pet?.client?.userId === user.id)
            return true;
          if (user.role === 'VET') {
            const vet = await this.prisma.vet.findUnique({
              where: { userId: user.id },
            });
            if (!vet) continue;
            if (record.appointment?.vetId === vet.id) return true;
            if (
              vet.clinicId &&
              record.appointment?.vet &&
              record.appointment.vet.clinicId &&
              vet.clinicId === record.appointment.vet.clinicId
            )
              return true;
          }
        }
        if (resource === 'educational-materials') {
          const material = await this.prisma.educationalMaterial.findUnique({
            where: { id },
            include: {
              pets: { include: { client: true } },
              appointments: {
                include: { pet: { include: { client: true } }, vet: true },
              },
            },
          });
          if (!material) continue;
          // If any linked pet belongs to client, allow
          if (user.role === 'CLIENT') {
            const belongs = (material.pets || []).some(
              (p) => p.client?.userId === user.id,
            );
            if (belongs) return true;
            // check appointments' pet owners as well
            const appBelongs = (material.appointments || []).some(
              (a) => a.pet?.client?.userId === user.id,
            );
            if (appBelongs) return true;
          }
          if (user.role === 'VET') {
            const vet = await this.prisma.vet.findUnique({
              where: { userId: user.id },
            });
            if (!vet) continue;
            // allow vets of same clinic as appointment vets linked to material
            const appVetMatch = (material.appointments || []).some(
              (a) =>
                a.vet &&
                a.vet.clinicId &&
                vet.clinicId &&
                a.vet.clinicId === vet.clinicId,
            );
            if (appVetMatch) return true;
            // allow vets generally to manage materials
            return true;
          }
        }
      }
    }

    return false;
  }
}
