import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { environment } from "../environments/environment";

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface BasePricingHeader {
  priceHeaderId?: number;
  customerId?: number;
  termsAndConditionsId?: number;
  invoiceMinimum?: number;
  container55gMinimum?: number;
  absoluteContainerMinimum?: number;
  regionalPricingId?: number;
  conversionRateId?: number;
  customerPricingTierId?: number;
  createdByUser?: number;
  createdTimestamp?: Date;
  updateByUser?: number;
  updateTimestamp?: Date;
}

export interface BasePricing {
  basePricingId?: number;
  statusCodeId: number;
  activeInd: number;
  regionId?: number;
  customerId?: number;
  productId?: number;
  profileId?: number;
  generatorId?: number;
  contractId?: number;
  generatorRegionId?: number;
  generatorState?: string;
  vendorRegionId?: number;
  vendorId?: number;
  containerSizeId?: number;
  price?: number;
  billingUomId?: number;
  minimumPrice?: number;
  effectiveDate?: Date;
  expirationDate?: Date;
  quoteNumber?: string;
  createdByUser?: number;
  createdTimestamp?: Date;
  updateByUser?: number;
  updateTimestamp?: Date;
}

export interface PricingEntryRequest {
  header: BasePricingHeader;
  lineItems: BasePricing[];
  facilities: string[];
  generators: string[];
}

export interface Customer {
  customerId: number;
  customerName: string;
  customerCode: string;
}

export interface Product {
  productId: number;
  productName: string;
  productCode: string;
  wasteStream: string;
}

export interface Region {
  regionId: number;
  regionName: string;
  regionCode: string;
}

export interface ContainerSize {
  containerSizeId: number;
  sizeName: string;
  sizeCode: string;
}

export interface BillingUom {
  billingUomId: number;
  uomName: string;
  uomCode: string;
}

export interface TermsAndConditions {
  termsId: number;
  termsName: string;
  termsCode: string;
}

@Injectable({
  providedIn: "root",
})
export class PricingService {
  private baseUrl = `${environment.apiUrl}/api/pricing`;

  constructor(
    private http: HttpClient,
    private httpClientErrorHandlerService: any // Replace with your actual error handler service
  ) {}

  public getCustomers(): Observable<ApiResponse<Customer[]>> {
    return this.http
      .get<ApiResponse<Customer[]>>(`${this.baseUrl}/customers`)
      .pipe(
        catchError((err: Error | HttpErrorResponse) =>
          this.httpClientErrorHandlerService.handleError<Customer[]>(err)
        )
      );
  }

  public getProducts(): Observable<ApiResponse<Product[]>> {
    return this.http
      .get<ApiResponse<Product[]>>(`${this.baseUrl}/products`)
      .pipe(
        catchError((err: Error | HttpErrorResponse) =>
          this.httpClientErrorHandlerService.handleError<Product[]>(err)
        )
      );
  }

  public getRegions(): Observable<ApiResponse<Region[]>> {
    return this.http
      .get<ApiResponse<Region[]>>(`${this.baseUrl}/regions`)
      .pipe(
        catchError((err: Error | HttpErrorResponse) =>
          this.httpClientErrorHandlerService.handleError<Region[]>(err)
        )
      );
  }

  public getContainerSizes(): Observable<ApiResponse<ContainerSize[]>> {
    return this.http
      .get<ApiResponse<ContainerSize[]>>(`${this.baseUrl}/container-sizes`)
      .pipe(
        catchError((err: Error | HttpErrorResponse) =>
          this.httpClientErrorHandlerService.handleError<ContainerSize[]>(err)
        )
      );
  }

  public getBillingUoms(): Observable<ApiResponse<BillingUom[]>> {
    return this.http
      .get<ApiResponse<BillingUom[]>>(`${this.baseUrl}/billing-uoms`)
      .pipe(
        catchError((err: Error | HttpErrorResponse) =>
          this.httpClientErrorHandlerService.handleError<BillingUom[]>(err)
        )
      );
  }

  public getTermsAndConditions(): Observable<
    ApiResponse<TermsAndConditions[]>
  > {
    return this.http
      .get<ApiResponse<TermsAndConditions[]>>(
        `${this.baseUrl}/terms-and-conditions`
      )
      .pipe(
        catchError((err: Error | HttpErrorResponse) =>
          this.httpClientErrorHandlerService.handleError<TermsAndConditions[]>(
            err
          )
        )
      );
  }

  public getFacilities(): Observable<ApiResponse<string[]>> {
    return this.http
      .get<ApiResponse<string[]>>(`${this.baseUrl}/facilities`)
      .pipe(
        catchError((err: Error | HttpErrorResponse) =>
          this.httpClientErrorHandlerService.handleError<string[]>(err)
        )
      );
  }

  public getGenerators(): Observable<ApiResponse<string[]>> {
    return this.http
      .get<ApiResponse<string[]>>(`${this.baseUrl}/generators`)
      .pipe(
        catchError((err: Error | HttpErrorResponse) =>
          this.httpClientErrorHandlerService.handleError<string[]>(err)
        )
      );
  }

  public saveDraft(
    pricingData: PricingEntryRequest
  ): Observable<ApiResponse<{ priceHeaderId: number }>> {
    return this.http
      .post<ApiResponse<{ priceHeaderId: number }>>(
        `${this.baseUrl}/save-draft`,
        pricingData
      )
      .pipe(
        catchError((err: Error | HttpErrorResponse) =>
          this.httpClientErrorHandlerService.handleError<{
            priceHeaderId: number;
          }>(err)
        )
      );
  }

  public submitPricing(
    pricingData: PricingEntryRequest
  ): Observable<ApiResponse<{ priceHeaderId: number }>> {
    return this.http
      .post<ApiResponse<{ priceHeaderId: number }>>(
        `${this.baseUrl}/submit`,
        pricingData
      )
      .pipe(
        catchError((err: Error | HttpErrorResponse) =>
          this.httpClientErrorHandlerService.handleError<{
            priceHeaderId: number;
          }>(err)
        )
      );
  }

  public getPricingHeader(
    priceHeaderId: number
  ): Observable<ApiResponse<BasePricingHeader>> {
    return this.http
      .get<ApiResponse<BasePricingHeader>>(
        `${this.baseUrl}/header/${priceHeaderId}`
      )
      .pipe(
        catchError((err: Error | HttpErrorResponse) =>
          this.httpClientErrorHandlerService.handleError<BasePricingHeader>(err)
        )
      );
  }

  public getPricingLineItems(
    priceHeaderId: number
  ): Observable<ApiResponse<BasePricing[]>> {
    return this.http
      .get<ApiResponse<BasePricing[]>>(
        `${this.baseUrl}/line-items/${priceHeaderId}`
      )
      .pipe(
        catchError((err: Error | HttpErrorResponse) =>
          this.httpClientErrorHandlerService.handleError<BasePricing[]>(err)
        )
      );
  }

  public validatePricing(
    pricingData: PricingEntryRequest
  ): Observable<ApiResponse<{ isValid: boolean; errors: string[] }>> {
    return this.http
      .post<ApiResponse<{ isValid: boolean; errors: string[] }>>(
        `${this.baseUrl}/validate`,
        pricingData
      )
      .pipe(
        catchError((err: Error | HttpErrorResponse) =>
          this.httpClientErrorHandlerService.handleError<{
            isValid: boolean;
            errors: string[];
          }>(err)
        )
      );
  }

  private buildParams(params: any): HttpParams {
    let httpParams = new HttpParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });
    return httpParams;
  }
}
