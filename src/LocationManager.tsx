import { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Check, X } from 'lucide-react';

export interface Location {
  id: string;
  name: string;
  address?: string;
  createdAt: string;
}

interface LocationManagerProps {
  selectedLocation?: string;
  onLocationSelect: (location: string) => void;
  placeholder?: string;
  allowCustom?: boolean;
  required?: boolean;
}

const LocationManager = ({ 
  selectedLocation = '', 
  onLocationSelect, 
  placeholder = "Kino auswählen oder eingeben...",
  allowCustom = true,
  required = false 
}: LocationManagerProps) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationAddress, setNewLocationAddress] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [inputValue, setInputValue] = useState(selectedLocation);

  // Load locations from localStorage on component mount
  useEffect(() => {
    const savedLocations = localStorage.getItem('kinogutschein-locations');
    if (savedLocations) {
      try {
        setLocations(JSON.parse(savedLocations));
      } catch (error) {
        console.error('Error loading locations:', error);
        // Initialize with default locations if parsing fails
        initializeDefaultLocations();
      }
    } else {
      initializeDefaultLocations();
    }
  }, []);

  // Initialize with some common German cinema chains
  const initializeDefaultLocations = () => {
    const defaultLocations: Location[] = [
      { id: '1', name: 'CineStar', createdAt: new Date().toISOString() },
      { id: '2', name: 'UCI Kinowelt', createdAt: new Date().toISOString() },
      { id: '3', name: 'Cineplex', createdAt: new Date().toISOString() },
      { id: '4', name: 'Filmpalast', createdAt: new Date().toISOString() },
      { id: '5', name: 'Mathäser Filmpalast', createdAt: new Date().toISOString() },
    ];
    setLocations(defaultLocations);
    saveLocationsToStorage(defaultLocations);
  };

  // Save locations to localStorage
  const saveLocationsToStorage = (locationsToSave: Location[]) => {
    localStorage.setItem('kinogutschein-locations', JSON.stringify(locationsToSave));
  };

  // Add new location
  const addLocation = () => {
    if (!newLocationName.trim()) return;

    const newLocation: Location = {
      id: Date.now().toString(),
      name: newLocationName.trim(),
      address: newLocationAddress.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    const updatedLocations = [...locations, newLocation];
    setLocations(updatedLocations);
    saveLocationsToStorage(updatedLocations);

    // Auto-select the new location
    setInputValue(newLocation.name);
    onLocationSelect(newLocation.name);

    // Reset form
    setNewLocationName('');
    setNewLocationAddress('');
    setShowAddForm(false);
    setIsDropdownOpen(false);
  };

  // Remove location
  const removeLocation = (locationId: string) => {
    if (window.confirm('Möchten Sie diesen Standort wirklich entfernen?')) {
      const updatedLocations = locations.filter(loc => loc.id !== locationId);
      setLocations(updatedLocations);
      saveLocationsToStorage(updatedLocations);
    }
  };

  // Handle input change
  const handleInputChange = (value: string) => {
    setInputValue(value);
    onLocationSelect(value);
    if (value && !isDropdownOpen) {
      setIsDropdownOpen(true);
    }
  };

  // Filter locations based on input
  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Handle location selection from dropdown
  const selectLocation = (locationName: string) => {
    setInputValue(locationName);
    onLocationSelect(locationName);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <div className="relative">
            <MapPin className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => setIsDropdownOpen(true)}
              placeholder={placeholder}
              className="w-full pl-8 pr-8 p-2 text-sm border rounded focus:ring-2 focus:ring-blue-500"
              required={required}
            />
            {!required && inputValue && (
              <button
                onClick={() => {
                  setInputValue('');
                  onLocationSelect('');
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                title="Leeren"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Dropdown */}
          {isDropdownOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredLocations.length > 0 && (
                <div className="py-1">
                  <div className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-50">
                    Gespeicherte Standorte
                  </div>
                  {filteredLocations.map((location) => (
                    <div
                      key={location.id}
                      className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer group"
                    >
                      <div
                        onClick={() => selectLocation(location.name)}
                        className="flex-1"
                      >
                        <div className="font-medium text-sm">{location.name}</div>
                        {location.address && (
                          <div className="text-xs text-gray-500">{location.address}</div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeLocation(location.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-1"
                        title="Standort entfernen"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new location form */}
              {showAddForm ? (
                <div className="border-t p-3 bg-blue-50">
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newLocationName}
                      onChange={(e) => setNewLocationName(e.target.value)}
                      placeholder="Name des Kinos"
                      className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <input
                      type="text"
                      value={newLocationAddress}
                      onChange={(e) => setNewLocationAddress(e.target.value)}
                      placeholder="Adresse (optional)"
                      className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={addLocation}
                        disabled={!newLocationName.trim()}
                        className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        Hinzufügen
                      </button>
                      <button
                        onClick={() => {
                          setShowAddForm(false);
                          setNewLocationName('');
                          setNewLocationAddress('');
                        }}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-t">
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="w-full px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                  >
                    <Plus className="w-3 h-3" />
                    Neuen Standort hinzufügen
                  </button>
                </div>
              )}

              {/* Close dropdown option */}
              <div className="border-t">
                <button
                  onClick={() => setIsDropdownOpen(false)}
                  className="w-full px-3 py-2 text-xs text-gray-500 hover:bg-gray-50"
                >
                  Schließen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default LocationManager;