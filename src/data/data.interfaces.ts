export interface IGetFormattedDataFromTxtFileResponse {
  employeesSplit: string[];
  ratesSplit: string[];
}

export interface ICurrentEmployee {
  id: number;
  name: string;
  surname: string;
  department: ICurrentDepartment;
  salary: ICurrentSalaryStatement[];
  donations: ICurrentDonation[];
}

export type ICurrentEmployeeSection =
  | ICurrentEmployee
  | ICurrentDepartment
  | ICurrentSalaryStatement
  | ICurrentDonation;

export interface ICurrentDepartment {
  id: number;
  name: string;
}

interface ICurrentTransaction {
  id: number;
  date: Date;
}

export interface ICurrentSalaryStatement extends ICurrentTransaction {
  amount: number;
}

export interface ICurrentDonation extends ICurrentTransaction {
  amount: string;
}

export interface ICurrentRate {
  date: Date;
  sign: string;
  value: number;
}

interface IRewardData {
  id: number;
  name: string;
  surname: string;
}

export interface IRawRewardData extends IRewardData {
  totalDonation: string;
  reward: string;
}

export interface IFinalRewardData extends IRewardData {
  totalDonation: number;
  reward: number;
}

export interface IQueryParams {
  minDonation: number;
  rewardPool: number;
}
