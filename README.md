# Banking Payments Orchestration

## Overview
This project demonstrates a **bank payment orchestration system** built with **MuleSoft Anypoint**, **microservices**, and a **React consumer app**. It allows transferring money between bank accounts while enforcing business rules such as transaction limits and fraud checks.

---

## Architecture

The system consists of:

1. **MuleSoft / Anypoint Flow**  
   - Orchestrates the payment process.
   - Workflow rules:
     - **Amount < 5,000** → automatic transfer.  
     - **Amount ≥ 5,000** → manual review required.  
     - **Blocked account** → transfer denied.  

2. **Microservices (Spring Boot)**  
   - **Discovery Service** → manages service registration.  
   - **Notification Service** → sends alerts or messages.  
   - **Transaction Service** → handles payment transactions.  
   - **Fraud Service** → checks for suspicious transactions.  

3. **React Consumer App**  
   - Web interface for users to initiate payments.  
   - Sends requests to the MuleSoft workflow via the microservices REST APIs.  

