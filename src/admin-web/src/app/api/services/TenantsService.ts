/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Tenant } from '../models/Tenant';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export type CreateTenantRequest = {
    name: string;
    billingEmail: string;
    locale: string;
    currency: string;
};

export type UpdateTenantProfileRequest = {
    name?: string;
    billingEmail?: string;
    locale?: string;
    currency?: string;
};

export class TenantsService {
    /**
     * @returns Tenant Success
     * @throws ApiError
     */
    public static listTenants(): CancelablePromise<Array<Tenant>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/tenants',
        });
    }

    /**
     * @param requestBody 
     * @returns Tenant Success
     * @throws ApiError
     */
    public static createTenant(requestBody: CreateTenantRequest): CancelablePromise<Tenant> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/tenants',
            body: requestBody,
        });
    }

    /**
     * @param id 
     * @param requestBody 
     * @returns Tenant Success
     * @throws ApiError
     */
    public static updateTenantProfile(id: string, requestBody: UpdateTenantProfileRequest): CancelablePromise<Tenant> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/tenants/{id}/profile',
            path: {
                'id': id,
            },
            body: requestBody,
        });
    }

    /**
     * @param id 
     * @returns any Success
     * @throws ApiError
     */
    public static suspendTenant(id: string): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/tenants/{id}/suspend',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param id 
     * @returns any Success
     * @throws ApiError
     */
    public static reactivateTenant(id: string): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/tenants/{id}/reactivate',
            path: {
                'id': id,
            },
        });
    }
}
