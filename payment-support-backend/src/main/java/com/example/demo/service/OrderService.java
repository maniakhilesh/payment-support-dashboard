package com.example.demo.service;

import com.example.demo.dto.CreateOrderRequest;
import com.example.demo.dto.OrderResponse;
import com.example.demo.dto.PaymentAttemptResponse;
import com.example.demo.entity.Order;
import com.example.demo.entity.OrderStatus;
import com.example.demo.exception.NotFoundException;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.PaymentAttemptRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class OrderService {

	private final OrderRepository orderRepository;
	private final PaymentAttemptRepository paymentAttemptRepository;

	public OrderService(OrderRepository orderRepository, PaymentAttemptRepository paymentAttemptRepository) {
		this.orderRepository = orderRepository;
		this.paymentAttemptRepository = paymentAttemptRepository;
	}

	public OrderResponse createOrder(CreateOrderRequest request) {
		Order order = new Order();
		order.setAmount(request.getAmount());
		order.setCurrency(request.getCurrency().toUpperCase());
		order.setStatus(OrderStatus.CREATED);
		order.setCreatedAt(LocalDateTime.now());
		return toResponse(orderRepository.save(order), true);
	}

	@Transactional(readOnly = true)
	public List<OrderResponse> listOrders() {
		return orderRepository.findAll().stream().map(order -> toResponse(order, false)).toList();
	}

	@Transactional(readOnly = true)
	public OrderResponse getOrder(Long id) {
		Order order = orderRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Order not found: " + id));
		return toResponse(order, true);
	}

	public Order save(Order order) {
		return orderRepository.save(order);
	}

	@Transactional(readOnly = true)
	public Order getOrderEntity(Long id) {
		return orderRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Order not found: " + id));
	}

	private OrderResponse toResponse(Order order, boolean includeAttempts) {
		OrderResponse response = new OrderResponse();
		response.setId(order.getId());
		response.setAmount(order.getAmount());
		response.setCurrency(order.getCurrency());
		response.setStatus(order.getStatus().name());
		response.setCreatedAt(order.getCreatedAt());
		if (includeAttempts) {
			List<PaymentAttemptResponse> attempts = paymentAttemptRepository
					.findByOrder_IdOrderByAttemptTimeDesc(order.getId())
					.stream()
					.map(PaymentService::toAttemptResponse)
					.toList();
			response.setAttempts(attempts);
		}
		return response;
	}
}