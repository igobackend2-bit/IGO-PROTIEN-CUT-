import React from 'react';
import { motion } from 'motion/react';
import { Clock, Zap, Sun, Moon, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

const slots = [
  { id: 'express', label: 'Express Delivery', time: '90 Mins', icon: Zap, price: '₹49', color: 'bg-orange-50 text-orange-600 border-orange-200' },
  { id: 'morning', label: 'Morning Slot', time: '7 AM - 10 AM', icon: Sun, price: 'Free', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { id: 'afternoon', label: 'Afternoon Slot', time: '1 PM - 4 PM', icon: Sun, price: 'Free', color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { id: 'evening', label: 'Evening Slot', time: '6 PM - 9 PM', icon: Moon, price: 'Free', color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
];

const DeliverySlotPicker = () => {
  const { deliverySlot, setDeliverySlot } = useCart();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-neutral-dark text-sm uppercase tracking-widest flex items-center gap-2">
          <Clock className="w-4 h-4 text-igo-green" />
          Select Delivery Slot
        </h4>
        <span className="text-[10px] font-bold text-neutral-400 uppercase">Available Today</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {slots.map((slot) => {
          const Icon = slot.icon;
          const isSelected = deliverySlot === slot.id;
          
          return (
            <button
              key={slot.id}
              onClick={() => setDeliverySlot(slot.id)}
              className={`relative p-3 rounded-2xl border-2 transition-all text-left flex flex-col justify-between h-24 ${
                isSelected 
                  ? 'border-igo-green bg-igo-green/5 ring-4 ring-igo-green/10' 
                  : 'border-neutral-100 hover:border-neutral-200 bg-white'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className={`p-1.5 rounded-lg ${slot.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                {isSelected && (
                  <div className="w-4 h-4 bg-igo-green rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-[10px] font-bold text-neutral-dark leading-tight">{slot.label}</p>
                <div className="flex justify-between items-end mt-0.5">
                  <span className="text-[11px] font-medium text-neutral-400">{slot.time}</span>
                  <span className={`text-[10px] font-bold ${slot.price === 'Free' ? 'text-igo-green' : 'text-neutral-dark'}`}>{slot.price}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DeliverySlotPicker;
