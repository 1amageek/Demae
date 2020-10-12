# Demae

## Architecture

[EC Architecture for Firebase](https:miro.com/app/board/o9J_km01nvw=/)

## SalesMethod

| SalesMethod | Description |
|-|-|
| online | Sale of products that can be delivered |
| instore | Sale of products that can be sold in stores |
| pickup | Sale of products available for store pickup |
| download | Sale of downloadable products |

## Order

|  | online | instore | pickup | download | 
|-|-|-|-|-|
| Delivery | ○ | - | - | - |
| Payment | Capture later | Capture later | Capture later | Immediate |
| Cancel from Provider | Cancel available when DeliveryStatus is not `in_transit` | Cancel available when DeliveryStatus is not `preparing_for_delivery` | Cancel available when DeliveryStatus is not `preparing_for_delivery` | - |
| Cancel from Customer | Cancel available when DeliveryStatus is `preparing_for_delivery`, `out_for_delivery` | - | - | - |
| Refund from Provider | Refund fee 5% | Refund fee 5% | Refund fee 5% | Refund fee 5% |
| Cancel from Provider | Refund fee 10% | Refund fee 10% | Refund fee 80% | Refund fee 80% |


The Order can be cancelled until the Payment is captured.
After capture, a refund policy is required.

### DeliveryStatus

| DeliveryStatus | Description |
|-|-|
| none | Orders that do not need to be shipped. |
| pending | Delivery is pending. |
|	preparing_for_delivery | Preparing for delivery. |
|	out_for_delivery | Carrier is about to deliver the shipment , or it is ready to pickup. |
|	in_transit | Carrier has accepted or picked up shipment from shipper. The shipment is on the way. |
|	failed_attempt | Carrier attempted to deliver but failed, and usually leaves a notice and will try to delivery again. |
|	delivered | The shipment was delivered successfully. |
|	available_for_pickup | The package arrived at a pickup point near you and is available for pickup. |
|	exception | Custom hold, undelivered, returned shipment to sender or any shipping exceptions. |
|	expired | Shipment has no tracking information for 30 days since added.|

#### Differences in DeliveryStatus by sales method

__online__

1. `preparing_for_delivery`
1. `out_for_delivery`
1. `in_transit`
1. `pending`
1. `delivered`

__instore__

1. `preparing_for_delivery`
1. `out_for_delivery`
1. `delivered`

__pickup__

1. `preparing_for_delivery`
1. `available_for_pickup`
1. `delivered`

__download__

1. `none`

### PaymentStatus

| PaymentStatus | Description |
|-|-|
|	none | Free Product. |
|	processing | The customer’s payment was submitted to Stripe successfully. Only applicable to payment methods with delayed success confirmation. [https:stripe.com/docs/payments/payment-methods#payment-confirmation](https:stripe.com/docs/payments/payment-methods#payment-confirmation) |
|	succeeded | Customer’s payment succeeded |
|	payment_failed | Customer’s payment was declined by card network or otherwise expired |
|	canceled | Canceled order |

### RefundStatus

| RefundStatus | Description |
|-|-|
|	none | Not refunded |
|	pending | Customer is requesting a refund |
|	succeeded | Refunded |
|	failed | Refund failure |
