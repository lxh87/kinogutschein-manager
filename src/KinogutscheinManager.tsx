import { useState, useEffect } from 'react';
import { Calendar, Euro, Film, Plus, Trash2, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import LocationManager from './LocationManager';

// Define the types for the Gutschein and Einlösung
interface Einlösung {
  datum: string;
  film: string;
  uhrzeit: string;
  kino?: string; // Made optional
  anzahlPersonen: number; // Number of people who attended
  gutscheinId?: string; // Optional verification ID
}

interface Gutschein {
  id: number;
  name: string;
  kaufpreis: number;
  ablaufdatum: string;
  status: string;
  eingelöstAm?: string;
  film?: string;
  kino?: string;
  bestellnummer: string;
  konditionen: string;
  anzahlNutzungen: number;
  maxNutzungen: number;
  einlösungen: Einlösung[];
  mehrerePersonen: boolean;
}

// Define a type for the form data
interface GutscheinForm extends Omit<Gutschein, 'id' | 'kaufpreis'> {
    id?: number;
    kaufpreis: string | number;
}

const KinogutscheinManager = () => {
  const [gutscheine, setGutscheine] = useState<Gutschein[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMovieIndex, setEditingMovieIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<GutscheinForm>({
    id: undefined,
    name: '',
    kaufpreis: '',
    ablaufdatum: '',
    status: 'gültig',
    eingelöstAm: '',
    film: '',
    kino: '',
    bestellnummer: '',
    konditionen: '',
    anzahlNutzungen: 0,
    maxNutzungen: 1,
    einlösungen: [],
    mehrerePersonen: false
  });

  // Beispieldaten beim ersten Laden
  useEffect(() => {
    const beispielGutscheine: Gutschein[] = [
      {
        id: 1,
        name: 'CineStar 10er Gutschein',
        kaufpreis: 80.00, // Geschätzter Preis
        ablaufdatum: '2025-12-31',
        status: 'teilweise eingelöst',
        bestellnummer: '1006729134',
        konditionen: 'Bis zu 10 Kinogutscheine für 1 Person für 2D-Filme inkl. Sitzplatz & Filmzuschlag bei CineStar. Gültig ab 01.01.2025 bis 31.12.2025.',
        anzahlNutzungen: 6, // 6 movies × 1 person each = 6 usages
        maxNutzungen: 10,
        mehrerePersonen: false,
        einlösungen: [
          { datum: '2024-12-08', film: 'Wicked', uhrzeit: '19:45', kino: 'CineStar', anzahlPersonen: 1, gutscheinId: 'CS-001' },
          { datum: '2025-02-16', film: 'Captain America: Brave New World', uhrzeit: '19:45', kino: 'CineStar', anzahlPersonen: 1, gutscheinId: 'CS-002' },
          { datum: '2025-03-14', film: 'Mickey 17', uhrzeit: '22:45', kino: 'CineStar', anzahlPersonen: 1, gutscheinId: 'CS-003' },
          { datum: '2025-04-30', film: 'Thunderbolts*', uhrzeit: '22:20', kino: 'CineStar', anzahlPersonen: 1, gutscheinId: 'CS-004' },
          { datum: '2025-06-22', film: '28 Years Later', uhrzeit: '20:00', kino: 'CineStar', anzahlPersonen: 1, gutscheinId: 'CS-005' },
          { datum: '2025-07-22', film: 'Superman', uhrzeit: '20:10', kino: 'CineStar', anzahlPersonen: 1, gutscheinId: 'CS-006' }
        ]
      },
      {
        id: 2,
        name: '10 Tickets für 63€ (Kino-Gutschein)',
        kaufpreis: 63.00,
        ablaufdatum: '2026-03-15',
        status: 'gültig',
        bestellnummer: '',
        konditionen: 'Gültig für alle 2D-Filme inkl. Zuschläge. 3D-Zuschlag: +3€ (ggf. +1€ für 3D-Brille). Keine Einlösung bei Sonderveranstaltungen, Vorpremieren oder IMAX. Nicht einlösbar im Filmpalast am ZKM (Karlsruhe).',
        anzahlNutzungen: 0, // No movies watched yet
        maxNutzungen: 10,
        mehrerePersonen: false,
        einlösungen: []
      }
    ];
    setGutscheine(beispielGutscheine);
  }, []);

  const handleSubmit = () => {
    
    const neuerGutschein: Gutschein = {
      ...(formData as Gutschein),
      id: formData.id || Date.now(),
      kaufpreis: parseFloat(String(formData.kaufpreis)) || 0
    };

    if (formData.id) {
      // Bearbeiten
      setGutscheine(prev => prev.map(g => g.id === formData.id ? neuerGutschein : g));
    } else {
      // Neu hinzufügen
      setGutscheine(prev => [...prev, neuerGutschein]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      id: undefined,
      name: '',
      kaufpreis: '',
      ablaufdatum: '',
      status: 'gültig',
      eingelöstAm: '',
      film: '',
      kino: '',
      bestellnummer: '',
      konditionen: '',
      anzahlNutzungen: 0,
      maxNutzungen: 1,
      einlösungen: [],
      mehrerePersonen: false
    });
    setShowForm(false);
  };

  const bearbeiten = (gutschein: Gutschein) => {
    setFormData({
      ...gutschein,
      kaufpreis: gutschein.kaufpreis.toString()
    });
    setShowForm(true);
  };

  const [newMovieLocation, setNewMovieLocation] = useState('');
  const [newMovieAttendees, setNewMovieAttendees] = useState(1);
  const [newMovieGutscheinId, setNewMovieGutscheinId] = useState('');

  const addNewEinlösung = () => {
    const filmInput = document.getElementById('newFilm') as HTMLInputElement;
    const datumInput = document.getElementById('newDatum') as HTMLInputElement;
    const uhrzeitInput = document.getElementById('newUhrzeit') as HTMLInputElement;

    if (!filmInput.value || !datumInput.value || !uhrzeitInput.value) {
      alert('Bitte Filmtitel, Datum und Uhrzeit ausfüllen');
      return;
    }

    if (newMovieAttendees < 1) {
      alert('Anzahl Personen muss mindestens 1 sein');
      return;
    }

    const neueEinlösung: Einlösung = {
      film: filmInput.value,
      datum: datumInput.value,
      uhrzeit: uhrzeitInput.value,
      kino: newMovieLocation || undefined, // Optional location
      anzahlPersonen: newMovieAttendees,
      gutscheinId: newMovieGutscheinId || undefined // Optional verification ID
    };

    setFormData(prev => ({
      ...prev,
      einlösungen: [...(prev.einlösungen || []), neueEinlösung],
      anzahlNutzungen: (prev.anzahlNutzungen || 0) + newMovieAttendees
    }));

    // Clear form
    filmInput.value = '';
    datumInput.value = '';
    uhrzeitInput.value = '';
    setNewMovieLocation('');
    setNewMovieAttendees(1);
    setNewMovieGutscheinId('');
  };

  const removeEinlösung = (index: number) => {
    if (window.confirm('Möchten Sie diesen Film wirklich entfernen?')) {
      const removedEntry = formData.einlösungen?.[index];
      const removedCount = removedEntry?.anzahlPersonen || 1;
      
      setFormData(prev => ({
        ...prev,
        einlösungen: prev.einlösungen?.filter((_, i) => i !== index) || [],
        anzahlNutzungen: Math.max(0, (prev.anzahlNutzungen || 0) - removedCount)
      }));
    }
  };

  const startEditingMovie = (index: number) => {
    setEditingMovieIndex(index);
  };

  const [editMovieLocations, setEditMovieLocations] = useState<{[key: number]: string}>({});
  const [editMovieAttendees, setEditMovieAttendees] = useState<{[key: number]: number}>({});
  const [editMovieGutscheinIds, setEditMovieGutscheinIds] = useState<{[key: number]: string}>({});

  const saveMovieEdit = (index: number) => {
    const filmInput = document.getElementById(`editFilm-${index}`) as HTMLInputElement;
    const datumInput = document.getElementById(`editDatum-${index}`) as HTMLInputElement;
    const uhrzeitInput = document.getElementById(`editUhrzeit-${index}`) as HTMLInputElement;

    if (!filmInput.value || !datumInput.value || !uhrzeitInput.value) {
      alert('Bitte Filmtitel, Datum und Uhrzeit ausfüllen');
      return;
    }

    const attendees = editMovieAttendees[index] || formData.einlösungen?.[index]?.anzahlPersonen || 1;
    if (attendees < 1) {
      alert('Anzahl Personen muss mindestens 1 sein');
      return;
    }

    const oldAttendees = formData.einlösungen?.[index]?.anzahlPersonen || 1;
    const attendeesDiff = attendees - oldAttendees;

    setFormData(prev => ({
      ...prev,
      einlösungen: prev.einlösungen?.map((einlösung, i) => 
        i === index ? {
          film: filmInput.value,
          datum: datumInput.value,
          uhrzeit: uhrzeitInput.value,
          kino: editMovieLocations[index] || undefined, // Optional location
          anzahlPersonen: attendees,
          gutscheinId: editMovieGutscheinIds[index] || einlösung.gutscheinId || undefined
        } : einlösung
      ) || [],
      anzahlNutzungen: Math.max(0, (prev.anzahlNutzungen || 0) + attendeesDiff)
    }));

    setEditingMovieIndex(null);
    // Clear the edit states for this index
    setEditMovieLocations(prev => {
      const newState = { ...prev };
      delete newState[index];
      return newState;
    });
    setEditMovieAttendees(prev => {
      const newState = { ...prev };
      delete newState[index];
      return newState;
    });
    setEditMovieGutscheinIds(prev => {
      const newState = { ...prev };
      delete newState[index];
      return newState;
    });
  };

  const cancelMovieEdit = () => {
    setEditingMovieIndex(null);
  };

  const löschen = (id: number) => {
    if (window.confirm('Gutschein wirklich löschen?')) {
      setGutscheine(prev => prev.filter(g => g.id !== id));
    }
  };

  const alsEingelöstMarkieren = (id: number) => {
    const gutschein = gutscheine.find(g => g.id === id);
    if (gutschein) {
      setFormData({
        ...gutschein,
        kaufpreis: gutschein.kaufpreis.toString(),
        status: 'eingelöst',
        eingelöstAm: new Date().toISOString().split('T')[0]
      });
      setShowForm(true);
    }
  };

  const getStatusColor = (gutschein: Gutschein) => {
    if (gutschein.status === 'eingelöst') return 'text-green-600 bg-green-50';
    if (gutschein.status === 'teilweise eingelöst') return 'text-yellow-600 bg-yellow-50';
    
    const heute = new Date();
    const ablauf = new Date(gutschein.ablaufdatum);
    const differenzTage = Math.ceil((ablauf.getTime() - heute.getTime()) / (1000 * 60 * 60 * 24));
    
    if (differenzTage < 0) return 'text-red-600 bg-red-50';
    if (differenzTage <= 30) return 'text-orange-600 bg-orange-50';
    return 'text-blue-600 bg-blue-50';
  };

  const getStatusIcon = (gutschein: Gutschein) => {
    if (gutschein.status === 'eingelöst') return <CheckCircle2 className="w-4 h-4" />;
    
    const heute = new Date();
    const ablauf = new Date(gutschein.ablaufdatum);
    const differenzTage = Math.ceil((ablauf.getTime() - heute.getTime()) / (1000 * 60 * 60 * 24));
    
    if (differenzTage < 0) return <AlertTriangle className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  const formatDatum = (datum?: string) => {
    if (!datum) return '-';
    return new Date(datum).toLocaleDateString('de-DE');
  };

  const gültigeGutscheine = gutscheine.filter(g => (g.status === 'gültig' || g.status === 'teilweise eingelöst') && new Date(g.ablaufdatum) >= new Date());
  const eingelösteGutscheine = gutscheine.filter(g => g.status === 'eingelöst');
  const abgelaufeneGutscheine = gutscheine.filter(g => (g.status === 'gültig' || g.status === 'teilweise eingelöst') && new Date(g.ablaufdatum) < new Date());

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Film className="text-blue-600" />
          Kinogutschein-Manager
        </h1>
        
        {/* Statistiken */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800">Gültige Gutscheine</h3>
            <p className="text-2xl font-bold text-blue-600">{gültigeGutscheine.length}</p>
            <p className="text-sm text-blue-600">
              Wert: {gültigeGutscheine.reduce((sum, g) => sum + g.kaufpreis, 0).toFixed(2)}€
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800">Eingelöst</h3>
            <p className="text-2xl font-bold text-green-600">{eingelösteGutscheine.length}</p>
            <p className="text-sm text-green-600">
              Wert: {eingelösteGutscheine.reduce((sum, g) => sum + g.kaufpreis, 0).toFixed(2)}€
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800">Abgelaufen</h3>
            <p className="text-2xl font-bold text-red-600">{abgelaufeneGutscheine.length}</p>
            <p className="text-sm text-red-600">
              Wert: {abgelaufeneGutscheine.reduce((sum, g) => sum + g.kaufpreis, 0).toFixed(2)}€
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mb-6"
        >
          <Plus className="w-4 h-4" />
          Neuen Gutschein hinzufügen
        </button>
      </div>

      {/* Formular */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {formData.id ? 'Gutschein bearbeiten' : 'Neuen Gutschein hinzufügen'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name/Beschreibung</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Kaufpreis (€)</label>
              <input
                type="number"
                step="0.01"
                value={formData.kaufpreis}
                onChange={(e) => setFormData(prev => ({...prev, kaufpreis: e.target.value}))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Ablaufdatum</label>
              <input
                type="date"
                value={formData.ablaufdatum}
                onChange={(e) => setFormData(prev => ({...prev, ablaufdatum: e.target.value}))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Maximale Nutzungen</label>
              <input
                type="number"
                min="1"
                value={formData.maxNutzungen}
                onChange={(e) => setFormData(prev => ({...prev, maxNutzungen: parseInt(e.target.value) || 1}))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="mehrerePersonen"
                checked={!formData.mehrerePersonen}
                onChange={(e) => setFormData(prev => ({...prev, mehrerePersonen: !e.target.checked}))}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="mehrerePersonen" className="text-sm font-medium">
                Gutschein ist nur für eine Person gültig
              </label>
            </div>
            
            {formData.status === 'eingelöst' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Eingelöst am</label>
                  <input
                    type="date"
                    value={formData.eingelöstAm}
                    onChange={(e) => setFormData(prev => ({...prev, eingelöstAm: e.target.value}))}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Film</label>
                  <input
                    type="text"
                    value={formData.film}
                    onChange={(e) => setFormData(prev => ({...prev, film: e.target.value}))}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Kino</label>
                  <input
                    type="text"
                    value={formData.kino}
                    onChange={(e) => setFormData(prev => ({...prev, kino: e.target.value}))}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Bestellnummer (optional)</label>
              <input
                type="text"
                value={formData.bestellnummer}
                onChange={(e) => setFormData(prev => ({...prev, bestellnummer: e.target.value}))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Konditionen/Beschreibung (optional)</label>
              <textarea
                value={formData.konditionen}
                onChange={(e) => setFormData(prev => ({...prev, konditionen: e.target.value}))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 h-20"
                placeholder="Besondere Bedingungen, Einschränkungen, etc..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({...prev, status: e.target.value}))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="gültig">Gültig</option>
                <option value="teilweise eingelöst">Teilweise eingelöst</option>
                <option value="eingelöst">Vollständig eingelöst</option>
              </select>
            </div>
            {/* Einlösungen / Watched Movies Section */}
            {formData.id && (
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Film className="w-5 h-5" />
                  Gesehene Filme ({formData.einlösungen?.length || 0})
                </h3>
                
                {/* Existing Movies List */}
                {formData.einlösungen && formData.einlösungen.length > 0 && (
                  <div className="bg-gray-300 rounded-lg p-4 overflow-y-auto mb-4">
                    <div className="space-y-3">
                      {formData.einlösungen.map((einlösung, index) => (
                        <div key={index} className="bg-white rounded-lg p-3 shadow-sm border">
                          {editingMovieIndex === index ? (
                            // Edit Mode
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="md:col-span-2">
                                  <label className="block text-xs font-medium mb-1">Filmtitel</label>
                                  <input
                                    type="text"
                                    defaultValue={einlösung.film}
                                    className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-blue-500"
                                    id={`editFilm-${index}`}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium mb-1">Anzahl Personen</label>
                                  <input
                                    type="number"
                                    min="1"
                                    max="20"
                                    defaultValue={einlösung.anzahlPersonen}
                                    onChange={(e) => {
                                      setEditMovieAttendees(prev => ({
                                        ...prev,
                                        [index]: parseInt(e.target.value) || 1
                                      }));
                                    }}
                                    className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium mb-1">Datum</label>
                                  <input
                                    type="date"
                                    defaultValue={einlösung.datum}
                                    className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-blue-500"
                                    id={`editDatum-${index}`}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium mb-1">Uhrzeit</label>
                                  <input
                                    type="time"
                                    defaultValue={einlösung.uhrzeit}
                                    className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-blue-500"
                                    id={`editUhrzeit-${index}`}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium mb-1">Gutschein ID (optional)</label>
                                  <input
                                    type="text"
                                    defaultValue={einlösung.gutscheinId || ''}
                                    onChange={(e) => {
                                      setEditMovieGutscheinIds(prev => ({
                                        ...prev,
                                        [index]: e.target.value
                                      }));
                                    }}
                                    placeholder="z.B. CS-001"
                                    className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
                                <div>
                                  <label className="block text-xs font-medium mb-1">Kino (optional)</label>
                                  <LocationManager
                                    selectedLocation={einlösung.kino || ''}
                                    onLocationSelect={(location) => {
                                      setEditMovieLocations(prev => ({
                                        ...prev,
                                        [index]: location
                                      }));
                                    }}
                                    placeholder="Kino auswählen..."
                                    allowCustom={true}
                                    required={false}
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => saveMovieEdit(index)}
                                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center gap-1"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  Speichern
                                </button>
                                <button
                                  onClick={cancelMovieEdit}
                                  className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors"
                                >
                                  Abbrechen
                                </button>
                              </div>
                            </div>
                          ) : (
                            // View Mode
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Film className="w-4 h-4 text-blue-600" />
                                  <span className="font-medium text-gray-900">{einlösung.film}</span>
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {einlösung.anzahlPersonen} {einlösung.anzahlPersonen === 1 ? 'Person' : 'Personen'}
                                  </span>
                                  {einlösung.gutscheinId && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      ID: {einlösung.gutscheinId}
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                  <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(einlösung.datum).toLocaleDateString('de-DE', {
                                        weekday: 'short',
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {einlösung.uhrzeit}
                                    </span>
                                  </div>
                                  {einlösung.kino && (
                                    <div className="text-xs text-gray-500">
                                      📍 {einlösung.kino}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">#{index + 1}</span>
                                <button
                                  onClick={() => startEditingMovie(index)}
                                  className="text-blue-500 hover:text-blue-700 p-1"
                                  title="Film bearbeiten"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => removeEinlösung(index)}
                                  className="text-red-500 hover:text-red-700 p-1"
                                  title="Film entfernen"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add New Movie Form */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Neuen Film hinzufügen
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium mb-1">Filmtitel *</label>
                      <input
                        type="text"
                        placeholder="z.B. Wicked"
                        className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-blue-500"
                        id="newFilm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Anzahl Personen *</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={newMovieAttendees}
                        onChange={(e) => setNewMovieAttendees(parseInt(e.target.value) || 1)}
                        className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Datum *</label>
                      <input
                        type="date"
                        className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-blue-500"
                        id="newDatum"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Uhrzeit *</label>
                      <input
                        type="time"
                        className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-blue-500"
                        id="newUhrzeit"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Kino (optional)</label>
                      <LocationManager
                        selectedLocation={newMovieLocation}
                        onLocationSelect={setNewMovieLocation}
                        placeholder="Kino auswählen..."
                        allowCustom={true}
                        required={false}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Gutschein ID (optional)</label>
                      <input
                        type="text"
                        value={newMovieGutscheinId}
                        onChange={(e) => setNewMovieGutscheinId(e.target.value)}
                        placeholder="z.B. CS-001, UCI-123"
                        className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <button
                    onClick={addNewEinlösung}
                    className="mt-3 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Film hinzufügen
                  </button>
                </div>
              </div>
            )}

            <div className="md:col-span-2 flex gap-2">
              <button
                onClick={handleSubmit}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                {formData.id ? 'Aktualisieren' : 'Hinzufügen'}
              </button>
              <button
                onClick={resetForm}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gutschein-Liste */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nutzungsart</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nutzungen</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Preis</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ablaufdatum</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Bestellnr.</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {gutscheine.map((gutschein) => (
                <tr key={gutschein.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(gutschein)}`}>
                      {getStatusIcon(gutschein)}
                      {gutschein.status === 'eingelöst' ? 'Eingelöst' : 
                       gutschein.status === 'teilweise eingelöst' ? 'Teilweise eingelöst' :
                       new Date(gutschein.ablaufdatum) < new Date() ? 'Abgelaufen' : 'Gültig'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium">
                        {gutschein.name}
                      </div>
                      {gutschein.konditionen && (
                        <div className="text-xs text-gray-500 mt-1">{gutschein.konditionen.substring(0, 80)}...</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {!gutschein.mehrerePersonen ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Einzelperson
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Mehrere Personen
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <div className="font-medium">{gutschein.anzahlNutzungen || 0} / {gutschein.maxNutzungen || 1}</div>
                      {gutschein.einlösungen && gutschein.einlösungen.length > 0 && (
                        <div className="text-xs text-gray-500">
                          Letzter: {gutschein.einlösungen[gutschein.einlösungen.length - 1].film}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">{gutschein.kaufpreis.toFixed(2)}€</td>
                  <td className="px-4 py-3">{formatDatum(gutschein.ablaufdatum)}</td>
                  <td className="px-4 py-3 text-xs">{gutschein.bestellnummer || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => bearbeiten(gutschein)}
                        className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded"
                      >
                        Details
                      </button>
                      {(gutschein.status === 'gültig' || gutschein.status === 'teilweise eingelöst') && 
                       gutschein.anzahlNutzungen < gutschein.maxNutzungen && (
                        <button
                          onClick={() => alsEingelöstMarkieren(gutschein.id)}
                          className="text-green-600 hover:text-green-800 text-sm px-2 py-1 rounded"
                        >
                          Einlösen
                        </button>
                      )}
                      <button
                        onClick={() => löschen(gutschein.id)}
                        className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default KinogutscheinManager;