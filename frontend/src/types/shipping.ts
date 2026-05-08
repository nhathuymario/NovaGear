export type ShipmentStatus =
    | "READY_TO_SHIP"
    | "SHIPPED"
    | "IN_TRANSIT"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "CANCELLED"
    | "RETURNED"

export type ExceptionSeverity = "LOW" | "MEDIUM" | "HIGH"

export interface ShipmentTrackingEvent {
    id: number | string
    fromStatus: ShipmentStatus
    toStatus: ShipmentStatus
    note: string
    changedBy: string
    createdAt: string
}

export interface Shipment {
    id: number | string
    orderId: number | string
    userId: number | string
    orderCode: string
    receiverName: string
    receiverPhone: string
    shippingAddress: string
    note?: string
    carrierName?: string
    trackingNumber?: string
    shippingMethod?: string
    shippingFee: number
    estimatedDeliveryAt?: string
    status: ShipmentStatus
    statusNote?: string
    createdAt: string
    updatedAt: string
    shippedAt?: string
    deliveredAt?: string
    events: ShipmentTrackingEvent[]
}

export interface CreateShipmentRequest {
    orderId: number | string
    userId: number | string
    orderCode: string
    receiverName: string
    receiverPhone: string
    shippingAddress: string
    note?: string
    carrierName?: string
    trackingNumber?: string
    shippingMethod?: string
    shippingFee?: number
    estimatedDeliveryAt?: string
    status?: ShipmentStatus
}

export interface AssignCarrierRequest {
    carrierName: string
    trackingNumber: string
    shippingMethod?: string
    shippingFee?: number
    estimatedDeliveryAt?: string
    note?: string
}

export interface UpdateShipmentStatusRequest {
    status: ShipmentStatus
    note?: string
}

export interface ShipmentFilter {
    status?: ShipmentStatus
    carrierName?: string
    searchKeyword?: string
    startDate?: string
    endDate?: string
    page?: number
    pageSize?: number
}

export interface ShipmentException {
    id: number | string
    shipmentId: number | string
    exceptionType: string
    severity: ExceptionSeverity
    description: string
    evidencePhotos?: string[]
    status: "OPEN" | "RESOLVED" | "CLOSED"
    createdAt: string
    resolvedAt?: string
}

export interface Carrier {
    id: number | string
    name: string
    contactPhone?: string
    contactEmail?: string
    services?: {
        type: string
        baseFee: number
    }[]
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export interface ShippingReport {
    totalShipments: number
    deliveredCount: number
    returnedCount: number
    cancelledCount: number
    successRate: number
    returnRate: number
    averageDeliveryTime: number
    averageShippingFee: number
    period: {
        startDate: string
        endDate: string
    }
}

