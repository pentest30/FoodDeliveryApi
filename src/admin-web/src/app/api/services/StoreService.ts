/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Store } from '../models/Store';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export type UpsertStoreRequest = {
    addressLine: string;
    city: string;
    lat: number;
    lng: number;
    serviceRadiusKm: number;
};

export class StoreService {
    /**
     * Get current tenant's store
     * @returns Store Success
     * @throws ApiError
     */
    public static getStore(): CancelablePromise<Store | null> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/store',
        });
    }

    /**
     * Create or update current tenant's store
     * @param requestBody 
     * @returns Store Success
     * @throws ApiError
     */
    public static upsertStore(requestBody: UpsertStoreRequest): CancelablePromise<Store> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/store',
            body: requestBody,
        });
    }
}