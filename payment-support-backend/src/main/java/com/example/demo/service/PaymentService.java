package com.example.demo.service;

import com.example.demo.dto.PaymentAttemptResponse;
import com.example.demo.dto.PaymentSimulationMode;
import com.example.demo.entity.Order;
import com.example.demo.entity.OrderStatus;
import com.example.demo.entity.PaymentAttempt;
import com.example.demo.entity.PaymentAttemptStatus;
import com.example.demo.repository.PaymentAttemptRepository;
import java.time.LocalDateTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class PaymentService {

	private final OrderService orderService;
	private final PaymentAttemptRepository paymentAttemptRepository;

	public PaymentService(OrderService orderService, PaymentAttemptRepository paymentAttemptRepository) {
		this.orderService = orderService;
		this.paymentAttemptRepository = paymentAttemptRepository;
 	}

	public PaymentAttemptResponse simulatePayment(Long orderId, PaymentSimulationMode mode) {
		Order order = orderService.getOrderEntity(orderId);

		PaymentAttempt attempt = new PaymentAttempt();
		attempt.setOrder(order);
		attempt.setAttemptTime(LocalDateTime.now());

		switch (mode) {
			case FAILURE -> {
				attempt.setStatus(PaymentAttemptStatus.FAILURE);
				attempt.setErrorCode("PAYMENT_DECLINED");
				attempt.setMessage("The payment was declined.");
				order.setStatus(OrderStatus.PAYMENT_FAILED);
			}
			case TIMEOUT -> {
				attempt.setStatus(PaymentAttemptStatus.TIMEOUT);
				attempt.setErrorCode("PAYMENT_TIMEOUT");
				attempt.setMessage("The payment timed out.");
				order.setStatus(OrderStatus.PAYMENT_PENDING);
			}
			default -> {
				attempt.setStatus(PaymentAttemptStatus.SUCCESS);
				attempt.setMessage("Payment completed successfully.");
				order.setStatus(OrderStatus.PAID);
			}
		}

		paymentAttemptRepository.save(attempt);
		orderService.save(order);
		return toAttemptResponse(attempt);
	}

	public static PaymentAttemptResponse toAttemptResponse(PaymentAttempt attempt) {
		PaymentAttemptResponse response = new PaymentAttemptResponse();
		response.setId(attempt.getId());
		response.setOrderId(attempt.getOrder().getId());
		response.setStatus(attempt.getStatus().name());
		response.setErrorCode(attempt.getErrorCode());
		response.setMessage(attempt.getMessage());
		response.setAttemptTime(attempt.getAttemptTime());
		return response;
	}
}