import { Pipe, PipeTransform } from '@angular/core';
import { PaymentService } from '../services/payment.service';
import { NationalTaxService } from '../services/national-tax.service';
import { LaborInsService } from '../services/labor-ins.service';
import { SocialInsService } from '../services/social-ins.service';
import { Condition } from '../interfaces/condition';
import { Insurance } from '../interfaces/insurance';

@Pipe({
  name: 'calc',
})
export class CalcPipe implements PipeTransform {
  constructor(
    private paymentServise: PaymentService,
    private nationalTaxService: NationalTaxService,
    private laborInsService: LaborInsService,
    private socialInsService: SocialInsService
  ) {}

  transform(condition: Condition, key: string, rate?: Insurance): unknown {
    // 総支給額
    const {
      baseSalary,
      allowance,
      travelCost,
    } = this.paymentServise.getPayment(condition);
    const total: number = baseSalary + allowance + travelCost;

    // 各種保険料率
    const healthInsRateList = rate?.socialIns.healthInsRateList || [];
    const nursingInsRate = rate?.socialIns.nursingInsRate || 0;
    const pensionInsRate = rate?.socialIns.pensionInsRate || 0;
    const childrenInsRate = rate?.socialIns.childrenInsRate || 0;
    const compensationInsRate = rate?.compensationIns.rate || 0;
    const workerBurden = rate?.unemploymentIns.workerBurden || 0;
    const ownerBurden = rate?.unemploymentIns.ownerBurden || 0;

    // 社会保険（健康保険・厚生年金・介護保険・子育て拠出金）
    const {
      healthInsWorder,
      healthInsOwner,
    } = this.socialInsService.getHealthIns(
      total,
      condition.ins,
      condition.area,
      healthInsRateList
    );

    const {
      nursingInsWorker,
      nursingInsOwner,
    } = this.socialInsService.getNursingIns(
      total,
      condition.ins,
      condition.age,
      nursingInsRate
    );

    const {
      pensionInsWorker,
      pensionInsOwner,
    } = this.socialInsService.getPensionIns(
      total,
      condition.ins,
      pensionInsRate
    );

    const childrenIns: number = this.socialInsService.getChildrenIns(
      total,
      condition.ins,
      childrenInsRate
    );

    // 労働保険（労災保険・雇用保険）
    const compensationIns = this.laborInsService.getCompensationIns(
      total,
      compensationInsRate
    );
    const {
      unemploymentInsWorker,
      unemploymentInsOwner,
    } = this.laborInsService.getUnemploymentIns(
      total,
      condition.unemploymentIns,
      workerBurden,
      ownerBurden
    );

    // 社会保険料・雇用保険料 合計
    const insTotal: number =
      healthInsWorder +
      nursingInsWorker +
      pensionInsWorker +
      unemploymentInsWorker;

    // 源泉所得税
    const taxTargetFee: number =
      baseSalary + allowance - insTotal > 0
        ? baseSalary + allowance - insTotal
        : 0;
    const nationalTax: number = this.nationalTaxService.getNationalTax(
      taxTargetFee,
      condition.dependents
    );

    // 控除額合計
    const deductionTotal: number =
      insTotal + nationalTax + condition.cityTax + condition.otherDeduction;

    // 差引支給額（手取り額）
    const takeHomeFee: number = total - deductionTotal;

    // 事業者負担合計
    const ownerBurdenTotal: number =
      healthInsOwner +
      nursingInsOwner +
      pensionInsOwner +
      childrenIns +
      compensationIns +
      unemploymentInsOwner;

    // 事業者支出額合計
    const ownerDisbursementTotal: number = total + ownerBurdenTotal;

    const outputValues = {
      baseSalary,
      travelCost,
      total,
      compensationIns,
      unemploymentInsWorker,
      unemploymentInsOwner,
      childrenIns,
      pensionInsWorker,
      pensionInsOwner,
      nursingInsWorker,
      nursingInsOwner,
      healthInsWorder,
      healthInsOwner,
      nationalTax,
      deductionTotal,
      takeHomeFee,
      ownerBurdenTotal,
      ownerDisbursementTotal,
    };

    return outputValues[key].toLocaleString();
  }
}
