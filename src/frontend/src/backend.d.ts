import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface VerificationLog {
    resultStatus: string;
    productSearched: string;
    timestamp: bigint;
}
export interface VerificationResult {
    status: string;
    matchedProductDetails?: Product;
    reason: string;
}
export interface UserProfile {
    name: string;
}
export interface Product {
    id: string;
    manufacturer: string;
    distributorContact: string;
    distributorCountry: string;
    name: string;
    distributorName: string;
    productionDate: string;
    currentOwner: string;
    serialNumber: string;
    batchNumber: string;
    distributorAddress: string;
    warrantyInfo: string;
    registeredAt: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getProduct(productId: string): Promise<Product>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVerificationHistory(): Promise<Array<VerificationLog>>;
    initialize(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    listProducts(): Promise<Array<Product>>;
    recordVerification(searchTerm: string, status: string): Promise<void>;
    registerProduct(product: Product): Promise<void>;
    removeProduct(productId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateProduct(product: Product): Promise<void>;
    verifyProduct(searchTerm: string): Promise<VerificationResult>;
}
