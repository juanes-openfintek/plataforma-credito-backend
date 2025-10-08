export declare class GetTaxesDto {
    minAmount: number;
    maxAmount: number;
    rateEffectiveAnnual: number;
    rateEffectiveMonthly: number;
    rateDefault: number;
    rateInsurance: number;
    rateAdministration: number;
}
export declare class UpdateTaxesDto extends GetTaxesDto {
    id: string;
}
