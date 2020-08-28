# Demae

## Architecture

https:miro.com/app/board/o9J_km01nvw=/


## Order

| Sales method | Delivery | Payment | Cancel | Refund |
|-|-|-|-|-|
| Online | ○ | Capture later | ○ | Refund fee 20% | 
| In Store | - | Capture later | ○ | Refund fee 80% |
| Pickup | - |  Capture later | ○ | Refund fee 80% |
| Download | - | Immediate | - | Refund fee 10% |


### DeliveryStatus

| DeliveryStatus | Description |
|-|-|
|none |	 Orders that do not need to be shipped. |
|pending |  Delivery is pending. |
|	preparing_for_delivery |  Preparing for delivery. |
|	out_for_delivery |  Carrier is about to deliver the shipment , or it is ready to pickup. |
|	in_transit |  Carrier has accepted or picked up shipment from shipper. The shipment is on the way. |
|	failed_attempt |  Carrier attempted to deliver but failed, and usually leaves a notice and will try to delivery again. |
|	delivered |  The shipment was delivered successfully. |
|	available_for_pickup |  The package arrived at a pickup point near you and is available for pickup. |
|	exception |  Custom hold, undelivered, returned shipment to sender or any shipping exceptions. |
|	expired  Shipment has no tracking information for 30 days since added.|

### PaymentStatus

| PaymentStatus | Description |
|-|-|
|	none |  Free Product. |
|	processing |  The customer’s payment was submitted to Stripe successfully. Only applicable to payment methods with delayed success confirmation. https:stripe.com/docs/payments/payment-methods#payment-confirmation |
|	succeeded |  Customer’s payment succeeded |
|	payment_failed | Customer’s payment was declined by card network or otherwise expired |
|	canceled | Canceled order |

### RefundStatus

| RefundStatus | Description |
|-|-|
|	none | Not refunded |
|	pending | Customer is requesting a refund |
|	succeeded | Refunded |
|	failed | Refund failure |
