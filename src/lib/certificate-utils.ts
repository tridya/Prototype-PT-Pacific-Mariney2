import { CertificateHealthResult } from '@/types/maritime';

export function calculateCertificateHealth(expiryDate: Date): CertificateHealthResult {
  const now = new Date();
  const daysRemaining = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  let health: 'critical' | 'warning' | 'good';
  
  if (daysRemaining < 7) {
    health = 'critical';
  } else if (daysRemaining < 30) {
    health = 'warning';
  } else {
    health = 'good';
  }
  
  return { health, daysRemaining };
}

export function getHealthColorClass(health: string): string {
  switch (health) {
    case 'critical':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'warning':
      return 'text-amber-600 bg-amber-50 border-amber-200';
    case 'good':
      return 'text-green-600 bg-green-50 border-green-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

export function getHealthBadgeColorClass(health: string): string {
  switch (health) {
    case 'critical':
      return 'bg-red-600 text-white hover:bg-red-700';
    case 'warning':
      return 'bg-amber-600 text-white hover:bg-amber-700';
    case 'good':
      return 'bg-green-600 text-white hover:bg-green-700';
    default:
      return 'bg-gray-600 text-white hover:bg-gray-700';
  }
}

export function getStatusColorClass(status: string): string {
  switch (status) {
    case 'Underway':
      return 'bg-blue-600 text-white';
    case 'At Anchor':
      return 'bg-amber-600 text-white';
    case 'Under Repair':
      return 'bg-red-600 text-white';
    case 'Available':
      return 'bg-green-600 text-white';
    case 'In Use':
      return 'bg-blue-600 text-white';
    case 'Maintenance':
      return 'bg-amber-600 text-white';
    case 'Broken':
      return 'bg-red-600 text-white';
    default:
      return 'bg-gray-600 text-white';
  }
}
