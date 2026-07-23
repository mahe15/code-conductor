export interface CostWarning {
  hasWarning: boolean;
  proposedTech: string;
  estimatedMonthlyCost: string;
  recommendedAlternative: string;
  recommendedCost: string;
  savingsMessage: string;
}

export class CostEstimatorService {
  public static evaluateArchitectureCost(promptOrCode: string): CostWarning {
    if (/kubernetes|eks|gke|aks/i.test(promptOrCode)) {
      return {
        hasWarning: true,
        proposedTech: 'Kubernetes (EKS/GKE Cluster)',
        estimatedMonthlyCost: '$150 - $350 / mo',
        recommendedAlternative: 'Single VPS (Hetzner / DigitalOcean) or Docker Compose',
        recommendedCost: '$5 - $20 / mo',
        savingsMessage: 'Saves ~$300/mo for early-stage MVP projects.',
      };
    }

    if (/aurora\s+global|multi-region\s+dynamodb/i.test(promptOrCode)) {
      return {
        hasWarning: true,
        proposedTech: 'Multi-Region Aurora / DynamoDB Global Tables',
        estimatedMonthlyCost: '$200+ / mo',
        recommendedAlternative: 'Single Instance Supabase Postgres',
        recommendedCost: '$25 / mo',
        savingsMessage: 'Single database region is sufficient for MVP stage.',
      };
    }

    return {
      hasWarning: false,
      proposedTech: '',
      estimatedMonthlyCost: '',
      recommendedAlternative: '',
      recommendedCost: '',
      savingsMessage: '',
    };
  }
}
