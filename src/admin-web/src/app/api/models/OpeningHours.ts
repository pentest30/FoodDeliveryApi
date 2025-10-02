/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export type DailyHours = {
    dayOfWeek: DayOfWeek;
    openAt?: string; // Time in HH:mm format (e.g., "09:00")
    closeAt?: string; // Time in HH:mm format (e.g., "17:00")
    isClosed: boolean;
};

export type OpeningHours = {
    id?: string;
    storeId?: string;
    hours: DailyHours[];
    created?: string;
    updated?: string;
};