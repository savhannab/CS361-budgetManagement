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


![414511400-7e59d966-7310-4617-9bc3-af47d9d3c36f](https://github.com/user-attachments/assets/401b4b7b-9cf5-4508-9ff3-604980491d0e)



Mitigation Plan:  
Teammate: BriAnna Foreman  
Status: In progress   
Access: github link  
Availability: 6 PM to 9 PM weekdays, anytime on weekends.  
Other Info: Budget categories are handled in frontend HTML using budget-category dropdown.  
