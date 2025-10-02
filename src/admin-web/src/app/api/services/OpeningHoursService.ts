/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OpeningHours, DailyHours } from '../models/OpeningHours';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export type SetOpeningHoursRequest = {
    hours: DailyHours[];
};

export class OpeningHoursService {
    /**
     * Get current store's opening hours
     * @returns OpeningHours Success
     * @throws ApiError
     */
    public static getOpeningHours(): CancelablePromise<OpeningHours | null> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/store/opening-hours',
        });
    }

    /**
     * Set current store's opening hours
     * @param requestBody 
     * @returns OpeningHours Success
     * @throws ApiError
     */
    public static setOpeningHours(requestBody: SetOpeningHoursRequest): CancelablePromise<OpeningHours> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/store/opening-hours',
            body: requestBody,
        });
    }
}