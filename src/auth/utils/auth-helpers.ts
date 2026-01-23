export function isRootAssumedForOrg(user: any, organizationId: string): boolean {
  if (!user || !user.isRoot) return false;
  
  // Must be a scoped token
  if (user.type !== 'scoped') return false;

  // Must have explicit assumed flag
  if (user.assumedByRoot !== true) return false;

  // Must match the organization being accessed (Strict Scope Check)
  if (user.activeOrganizationId !== organizationId) return false;

  return true;
}

export function getOrganizationIdFromRequest(request: any): string | null {
  return request.params.id || request.params.organizationId || request.params.orgId || null;
}
