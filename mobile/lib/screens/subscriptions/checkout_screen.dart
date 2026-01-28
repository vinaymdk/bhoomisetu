import 'package:flutter/material.dart';
import '../../models/payment.dart';
import '../../models/subscription.dart';
import '../../services/payments_service.dart';

class CheckoutScreen extends StatefulWidget {
  final String planId;

  const CheckoutScreen({super.key, required this.planId});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final PaymentsService _paymentsService = PaymentsService();
  final TextEditingController _paymentIdController = TextEditingController();
  final TextEditingController _signatureController = TextEditingController();
  SubscriptionPlan? _plan;
  String _gateway = 'razorpay';
  PaymentOrderResponse? _order;
  String _gatewayPaymentId = '';
  String _gatewaySignature = '';
  bool _loading = true;
  bool _submitting = false;
  String? _error;
  String? _message;

  @override
  void initState() {
    super.initState();
    _loadPlan();
  }

  @override
  void dispose() {
    _paymentIdController.dispose();
    _signatureController.dispose();
    super.dispose();
  }

  Future<void> _loadPlan() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final plan = await _paymentsService.getPlanById(widget.planId);
      setState(() {
        _plan = plan;
      });
    } catch (e) {
      setState(() {
        _error = e.toString().replaceAll('Exception: ', '');
      });
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  Future<void> _createOrder() async {
    setState(() {
      _submitting = true;
      _error = null;
      _message = null;
    });
    try {
      final order = await _paymentsService.createPaymentOrder(planId: widget.planId, gateway: _gateway);
      setState(() {
        _order = order;
        _gatewayPaymentId = order.orderId;
        _paymentIdController.text = order.orderId;
        _message = 'Order created. Use simulated payment ID to verify.';
      });
    } catch (e) {
      setState(() {
        _error = e.toString().replaceAll('Exception: ', '');
      });
    } finally {
      setState(() {
        _submitting = false;
      });
    }
  }

  Future<void> _verifyPayment() async {
    if (_order == null) return;
    setState(() {
      _submitting = true;
      _error = null;
      _message = null;
    });
    try {
      await _paymentsService.verifyPayment(
        paymentId: _order!.paymentId,
        gatewayPaymentId: _gatewayPaymentId.isEmpty ? _order!.orderId : _gatewayPaymentId,
        gatewaySignature: _gatewaySignature,
      );
      setState(() {
        _message = 'Payment verified and subscription activated.';
      });
    } catch (e) {
      setState(() {
        _error = e.toString().replaceAll('Exception: ', '');
      });
    } finally {
      setState(() {
        _submitting = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Checkout')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Padding(padding: const EdgeInsets.all(24), child: Text(_error!)))
              : _plan == null
                  ? const Center(child: Text('Plan not found.'))
                  : SingleChildScrollView(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _plan!.displayName,
                            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 6),
                          Text('₹${_plan!.price.toStringAsFixed(0)} / ${_plan!.billingPeriod}'),
                          const SizedBox(height: 16),
                          DropdownButtonFormField<String>(
                            value: _gateway,
                            decoration: const InputDecoration(labelText: 'Gateway'),
                            items: const [
                              DropdownMenuItem(value: 'razorpay', child: Text('Razorpay (simulated)')),
                              DropdownMenuItem(value: 'stripe', child: Text('Stripe (simulated)')),
                            ],
                            onChanged: (value) {
                              if (value == null) return;
                              setState(() => _gateway = value);
                            },
                          ),
                          const SizedBox(height: 12),
                          ElevatedButton(
                            onPressed: _submitting ? null : _createOrder,
                            child: const Text('Create payment order'),
                          ),
                          if (_order != null) ...[
                            const SizedBox(height: 12),
                            Text('Payment ID: ${_order!.paymentId}'),
                            Text('Order ID: ${_order!.orderId}'),
                          ],
                          const Divider(height: 32),
                          const Text(
                            'Verify Payment (Simulated)',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 8),
                          TextField(
                            decoration: const InputDecoration(labelText: 'Gateway payment ID'),
                            controller: _paymentIdController,
                            onChanged: (value) => _gatewayPaymentId = value,
                          ),
                          const SizedBox(height: 8),
                          TextField(
                            decoration: const InputDecoration(labelText: 'Gateway signature (optional)'),
                            controller: _signatureController,
                            onChanged: (value) => _gatewaySignature = value,
                          ),
                          const SizedBox(height: 12),
                          ElevatedButton(
                            onPressed: (_order == null || _submitting) ? null : _verifyPayment,
                            child: const Text('Verify payment'),
                          ),
                          if (_message != null) ...[
                            const SizedBox(height: 12),
                            Text(_message!, style: const TextStyle(color: Colors.green)),
                          ],
                          if (_error != null) ...[
                            const SizedBox(height: 12),
                            Text(_error!, style: const TextStyle(color: Colors.red)),
                          ],
                        ],
                      ),
                    ),
    );
  }
}
