Overview:
Microservice A - how to request and receive data, example code, UML diagram, and mitigation plan.  
Communication Pipe: Fetch API (Frontend) and Flask (Backend)  

Example Call Request:  
- POST /api/budget-item: Adds a budget item with amount.
  
  fetch('/api/budget-item', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    category: document.getElementById('budget-category').value,
    amount: parseFloat(document.getElementById('allocation-amount').value)
  })
})
  .then(response => response.json())
  .then(data => console.log('Budget item added:', data))
  .catch(error => console.error('Error:', error));

  Example Call Recieve:
- GET /api/budget-item: Retrieves all budget items.

  fetch('/api/budget-item')
  .then(response => response.json())
  .then(data => console.log(data));

UML:


![414502937-a28debe3-3cd7-4567-877c-b50368ee4665](https://github.com/user-attachments/assets/405ff10f-52a5-492f-8499-ae533425ab90)


Mitigation Plan:  
Teammate: BriAnna Foreman  
Status: In progress   
Access: github link  
Availability: 6 PM to 9 PM weekdays, anytime on weekends.  
Other Info: Budget categories are handled in frontend HTML using budget-category dropdown.  
