export type SpecialDayType =
  | "vacation"
  | "sick"
  | "day_off";

export interface SpecialDay {
  id: string;
  startDate: string;
  endDate: string;
  type: SpecialDayType;
}
