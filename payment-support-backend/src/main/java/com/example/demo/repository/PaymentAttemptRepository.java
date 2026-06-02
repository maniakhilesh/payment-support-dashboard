package com.example.demo.repository;

import com.example.demo.entity.PaymentAttempt;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentAttemptRepository extends JpaRepository<PaymentAttempt, Long> {

	List<PaymentAttempt> findByOrder_IdOrderByAttemptTimeDesc(Long orderId);
}