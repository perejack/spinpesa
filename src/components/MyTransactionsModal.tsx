import React, { useEffect, useState } from 'react';
import { getUserTransactions } from '../utils/supabaseClient';
import { Loader2, CreditCard, CheckCircle, XCircle } from 'lucide-react';

interface MyTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
}

const MyTransactionsModal: React.FC<MyTransactionsModalProps> = ({ isOpen, onClose, phoneNumber }) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && phoneNumber) {
      setLoading(true);
      getUserTransactions(phoneNumber).then((data) => {
        setTransactions(data);
        setLoading(false);
      });
    }
  }, [isOpen, phoneNumber]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in px-3 py-4 sm:px-6 sm:py-6">
      <div className="relative w-full max-w-md mx-auto animate-slide-up bg-gradient-to-br from-slate-900/95 via-purple-900/95 to-slate-900/95 rounded-2xl shadow-2xl border border-purple-500/20 p-6">
        <button onClick={onClose} className="absolute top-3 right-3 text-white hover:text-purple-400 text-xl">&times;</button>
        <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-purple-400" />
          My Transactions
        </h2>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="animate-spin w-8 h-8 text-purple-400" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center text-purple-200 py-8">No transactions found.</div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {transactions.map((tx, idx) => (
              <div key={tx.id || idx} className="bg-slate-800/80 rounded-lg p-4 flex items-center gap-4 border border-purple-600/20">
                <div>
                  {tx.status === 'Success' ? (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-white text-base">
                    {tx.amount} KSH
                  </div>
                  <div className="text-xs text-purple-200">
                    {tx.status} {tx.result_desc && `- ${tx.result_desc}`}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {new Date(tx.created_at).toLocaleString()}
                  </div>
                  {tx.mpesa_receipt && (
                    <div className="text-xs text-green-300 mt-1">
                      Receipt: {tx.mpesa_receipt}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTransactionsModal;
