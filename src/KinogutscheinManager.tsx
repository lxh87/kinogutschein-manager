import { useState, useEffect } from 'react';
import { Calendar, Euro, Film, Plus, Trash2, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

// Define the types for the Gutschein and Einlösung
interface Einlösung {
  datum: string;
  film: string;
  uhrzeit: string;
  kino: string;
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
        anzahlNutzungen: 6,
        maxNutzungen: 10,
        mehrerePersonen: false,
        einlösungen: [
          { datum: '2024-12-08', film: 'Wicked', uhrzeit: '19:45', kino: 'CineStar' },
          { datum: '2025-02-16', film: 'Captain America: Brave New World', uhrzeit: '19:45', kino: 'CineStar' },
          { datum: '2025-03-14', film: 'Mickey 17', uhrzeit: '22:45', kino: 'CineStar' },
          { datum: '2025-04-30', film: 'Thunderbolts*', uhrzeit: '22:20', kino: 'CineStar' },
          { datum: '2025-06-22', film: '28 Years Later', uhrzeit: '20:00', kino: 'CineStar' },
          { datum: '2025-07-22', film: 'Superman', uhrzeit: '20:10', kino: 'CineStar' }
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
        anzahlNutzungen: 0,
        maxNutzungen: 10,
        mehrerePersonen: true,
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
                checked={formData.mehrerePersonen}
                onChange={(e) => setFormData(prev => ({...prev, mehrerePersonen: e.target.checked}))}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="mehrerePersonen" className="text-sm font-medium">
                Für mehrere Personen gleichzeitig einlösbar
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
                      <div className="font-medium flex items-center gap-2">
                        {gutschein.name}
                        {gutschein.mehrerePersonen && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Mehrere Personen
                          </span>
                        )}
                      </div>
                      {gutschein.konditionen && (
                        <div className="text-xs text-gray-500 mt-1">{gutschein.konditionen.substring(0, 80)}...</div>
                      )}
                    </div>
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