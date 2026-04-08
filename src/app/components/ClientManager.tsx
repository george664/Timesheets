"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, CheckCircle2, X, Users, ChevronDown, ChevronUp } from "lucide-react";
import { Client } from "@/app/utils/billing";

const STORAGE_KEY = "time_tracker_clients";

interface StoredClient extends Client {
  email: string;
  address: string;
  city: string;
  phone: string;
}

function loadClients(): StoredClient[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveClients(clients: StoredClient[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
}

interface ClientManagerProps {
  onClientsChange: (clients: Client[]) => void;
  selectedClientId: string | null;
  onClientSelect: (clientId: string | null) => void;
}

export function ClientManager({ onClientsChange, selectedClientId, onClientSelect }: ClientManagerProps) {
  const [clients, setClients] = useState<StoredClient[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const [name, setName] = useState("");
  const [keywords, setKeywords] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const list = loadClients();
    setClients(list);
    onClientsChange(list);
  }, []);

  const syncClients = (list: StoredClient[]) => {
    saveClients(list);
    setClients(list);
    onClientsChange(list);
  };

  const handleAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !keywords) return;

    const current = loadClients();
    let updated: StoredClient[];

    if (isEditing) {
      updated = current.map((c) =>
        c.id === isEditing ? { ...c, name, keywords, email, address, city, phone } : c
      );
    } else {
      const newClient: StoredClient = {
        id: crypto.randomUUID(),
        name,
        keywords,
        email,
        address,
        city,
        phone,
      };
      updated = [...current, newClient];
    }

    syncClients(updated);
    resetForm();
  };

  const handleEdit = (client: StoredClient) => {
    setIsEditing(client.id);
    setName(client.name);
    setKeywords(client.keywords);
    setEmail(client.email || "");
    setAddress(client.address || "");
    setCity(client.city || "");
    setPhone(client.phone || "");
    setShowForm(true);
    setShowContact(!!(client.email || client.address || client.city || client.phone));
  };

  const handleDelete = (id: string) => {
    syncClients(loadClients().filter((c) => c.id !== id));
  };

  const resetForm = () => {
    setIsEditing(null);
    setName("");
    setKeywords("");
    setEmail("");
    setAddress("");
    setCity("");
    setPhone("");
    setShowForm(false);
    setShowContact(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="font-semibold text-gray-900 text-sm">Clients</span>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Client
          </button>
        )}
      </div>

      {showForm && (
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">
              {isEditing ? "Edit Client" : "New Client"}
            </span>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleAddOrUpdate} className="flex flex-col gap-2.5">
            <input
              type="text"
              placeholder="Client name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              required
            />
            <input
              type="text"
              placeholder="Keywords (e.g. ACME, sync)"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              required
            />

            <button
              type="button"
              onClick={() => setShowContact(!showContact)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
            >
              {showContact ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              Contact details
            </button>

            {showContact && (
              <div className="flex flex-col gap-2 pl-2 border-l-2 border-indigo-200">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                />
              </div>
            )}

            <button
              type="submit"
              className="flex items-center justify-center gap-1.5 w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {isEditing ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {isEditing ? "Save Changes" : "Add Client"}
            </button>
          </form>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {clients.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">No clients yet.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {clients.map((client) => {
              const isSelected = selectedClientId === client.id;
              return (
                <li
                  key={client.id}
                  onClick={() => onClientSelect(isSelected ? null : client.id)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-indigo-50 border-l-2 border-indigo-600"
                      : "hover:bg-gray-50 border-l-2 border-transparent"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className={`font-medium text-sm truncate ${isSelected ? "text-indigo-900" : "text-gray-900"}`}>
                        {client.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 truncate">{client.keywords}</p>
                      {client.email && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{client.email}</p>
                      )}
                    </div>
                    <div className="flex gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleEdit(client)}
                        className="p-1.5 text-gray-300 hover:text-indigo-600 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
