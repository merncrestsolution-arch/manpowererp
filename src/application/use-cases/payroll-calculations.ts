const STANDARD_MONTHLY_HOURS = 176;

export function decimalToNumber(
  value: { toString(): string } | number | null | undefined,
): number {
  if (value === null || value === undefined) {
    return 0;
  }
  return typeof value === "number" ? value : Number(value);
}

export function roundCurrency(value: number): number {
  return Number(value.toFixed(2));
}

export function calculateComponentAmount(
  basicSalary: number,
  calculationType: "FIXED" | "PERCENTAGE_OF_BASIC",
  configuredValue: number,
): number {
  if (calculationType === "PERCENTAGE_OF_BASIC") {
    return roundCurrency((basicSalary * configuredValue) / 100);
  }
  return roundCurrency(configuredValue);
}

export function calculateOvertimePay(
  basicSalary: number,
  overtimeRecords: Array<{
    hours: { toString(): string };
    rateMultiplier: { toString(): string };
  }>,
): number {
  if (!basicSalary || overtimeRecords.length === 0) {
    return 0;
  }

  const hourlyRate = basicSalary / STANDARD_MONTHLY_HOURS;

  return roundCurrency(
    overtimeRecords.reduce((sum, record) => {
      const hours = decimalToNumber(record.hours);
      const multiplier = decimalToNumber(record.rateMultiplier);
      return sum + hours * hourlyRate * multiplier;
    }, 0),
  );
}

export type ComputedLineItem = {
  label: string;
  type: "BASIC" | "ALLOWANCE" | "DEDUCTION" | "OVERTIME";
  amount: number;
  isTaxable: boolean;
};

export type PayrollComputation = {
  basicSalary: number;
  totalAllowances: number;
  totalDeductions: number;
  overtimePay: number;
  grossSalary: number;
  netSalary: number;
  lineItems: ComputedLineItem[];
};

type SalaryAssignment = {
  value: { toString(): string } | null;
  salaryComponent: {
    name: string;
    type: "ALLOWANCE" | "DEDUCTION";
    calculationType: "FIXED" | "PERCENTAGE_OF_BASIC";
    defaultValue: { toString(): string };
    isTaxable: boolean;
  };
};

export function computeEmployeePayroll(
  basicSalary: number,
  assignments: SalaryAssignment[],
  overtimeRecords: Array<{
    hours: { toString(): string };
    rateMultiplier: { toString(): string };
  }>,
): PayrollComputation {
  const lineItems: ComputedLineItem[] = [
    {
      label: "Basic Salary",
      type: "BASIC",
      amount: roundCurrency(basicSalary),
      isTaxable: true,
    },
  ];

  let totalAllowances = 0;
  let totalDeductions = 0;

  for (const assignment of assignments) {
    const component = assignment.salaryComponent;
    const configuredValue = decimalToNumber(
      assignment.value ?? component.defaultValue,
    );
    const amount = calculateComponentAmount(
      basicSalary,
      component.calculationType,
      configuredValue,
    );

    if (amount <= 0) {
      continue;
    }

    lineItems.push({
      label: component.name,
      type: component.type,
      amount,
      isTaxable: component.isTaxable,
    });

    if (component.type === "ALLOWANCE") {
      totalAllowances += amount;
    } else {
      totalDeductions += amount;
    }
  }

  const overtimePay = calculateOvertimePay(basicSalary, overtimeRecords);
  if (overtimePay > 0) {
    lineItems.push({
      label: "Overtime Pay",
      type: "OVERTIME",
      amount: overtimePay,
      isTaxable: true,
    });
  }

  const grossSalary = roundCurrency(
    basicSalary + totalAllowances + overtimePay,
  );
  const netSalary = roundCurrency(grossSalary - totalDeductions);

  return {
    basicSalary: roundCurrency(basicSalary),
    totalAllowances: roundCurrency(totalAllowances),
    totalDeductions: roundCurrency(totalDeductions),
    overtimePay,
    grossSalary,
    netSalary,
    lineItems,
  };
}
