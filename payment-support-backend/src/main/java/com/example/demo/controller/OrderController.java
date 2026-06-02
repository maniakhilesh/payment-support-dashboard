package com.example.demo.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.CreateOrderRequest;
import com.example.demo.dto.OrderResponse;
import com.example.demo.dto.PaymentAttemptResponse;
import com.example.demo.dto.PaymentSimulationMode;
import com.example.demo.service.OrderService;
import com.example.demo.service.PaymentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

	private final OrderService orderService;
	private final PaymentService paymentService;

	public OrderController(OrderService orderService, PaymentService paymentService) {
		this.orderService = orderService;
		this.paymentService = paymentService;
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public OrderResponse createOrder(@Valid @RequestBody CreateOrderRequest request) {
		return orderService.createOrder(request);
	}

	@GetMapping
	public List<OrderResponse> listOrders() {
		return orderService.listOrders();
	}

	@GetMapping("/{id}")
	public OrderResponse getOrder(@PathVariable Long id) {
		return orderService.getOrder(id);
	}

	@PostMapping("/{id}/pay")
	public PaymentAttemptResponse simulatePayment(
			@PathVariable Long id,
			@RequestParam(defaultValue = "SUCCESS") PaymentSimulationMode mode) {
		return paymentService.simulatePayment(id, mode);
	}
}