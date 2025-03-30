import { Medication } from "./medication";

/**
 * Represents the frequency options for medication scheduling.
 * - 'daily': Medication is taken every day.
 * - 'weekly': Medication is taken on specific days of the week.
 * - 'custom': Medication is taken on custom specified dates.
 * - 'interval': Medication is taken at fixed time intervals.
 */
type Frequency = 'daily' | 'weekly' | 'custom' | 'interval';

/**
 * Base interface for a medication schedule.
 * Contains properties common to all scheduling types.
 */
interface BaseSchedule {
    medication_id: Medication["id"]
    frequency: Frequency;
    timesInDay: number;
    endDate?: Date;
    exceptions?: Date[];
}

/**
 * Interface for a daily medication schedule.
 * In this schedule, the medication is taken every day at specified times.
 */
export interface DailySchedule extends BaseSchedule {
    frequency: 'daily';
    times: string[];
}

/**
 * Interface for a weekly medication schedule.
 * In this schedule, the medication is taken on specific days of the week.
 */
export interface WeeklySchedule extends BaseSchedule {
    frequency: 'weekly';

    daySchedules: Array<{
      day: string;
      times: string[];
    }>;
}

/**
 * Interface for an interval-based medication schedule.
 * In this schedule, the medication is taken at a fixed interval (e.g., every 2 days).
 */
export interface IntervalSchedule extends BaseSchedule {
    frequency: 'interval';
    intervalInDays: number;
}