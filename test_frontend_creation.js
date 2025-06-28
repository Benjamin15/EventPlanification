// Test de création d'événement depuis l'interface
// À exécuter dans la console du navigateur

// Fonction pour tester la création d'événement
async function testEventCreation() {
  const eventData = {
    name: 'Test Frontend Event',
    description: 'Événement créé depuis le frontend',
    location: 'Test Location',
    start_date: '2025-08-01T10:00:00',
    end_date: '2025-08-03T18:00:00',
    chalet_link: 'https://example.com/chalet'
  };

  try {
    const response = await fetch('http://localhost:8000/events/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Événement créé avec succès:', result);
      return result;
    } else {
      const error = await response.text();
      console.error('❌ Erreur lors de la création:', error);
      return null;
    }
  } catch (error) {
    console.error('❌ Erreur de connexion:', error);
    return null;
  }
}

// Exécuter le test
testEventCreation();
