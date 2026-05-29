import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, MessageSquare, CheckCircle2, Clock, Send, User } from 'lucide-react';
import { getCustomerQueries, replyToQuery, CustomerQuery } from '../../services/queryService';

const CustomerQueries = () => {
  const [queries, setQueries] = useState<CustomerQuery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuery, setSelectedQuery] = useState<CustomerQuery | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchQueries = async () => {
    setIsLoading(true);
    const data = await getCustomerQueries();
    setQueries(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const handleReply = async () => {
    if (!selectedQuery || !replyText.trim()) return;
    setIsReplying(true);
    
    const result = await replyToQuery(
      selectedQuery.id,
      selectedQuery.customer_email,
      selectedQuery.subject,
      replyText,
      selectedQuery.customer_email.split('@')[0] // rough name
    );

    if (result.success) {
      setReplyText('');
      setSelectedQuery(null);
      fetchQueries();
    } else {
      alert('Failed to send reply');
    }
    
    setIsReplying(false);
  };

  const filteredQueries = queries.filter(q => 
    q.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
    q.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-neutral-800 mb-2">Customer Queries</h1>
          <p className="text-neutral-500">Manage support requests and customer communications.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search queries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm w-64 focus:ring-2 focus:ring-igo-green/20 focus:border-igo-green transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-6 h-[70vh]">
        {/* Queries List */}
        <div className="w-1/3 bg-white rounded-2xl border border-neutral-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-neutral-100 bg-neutral-50 font-bold text-sm text-neutral-600">
            Inbox ({queries.filter(q => q.status === 'open').length} Unresolved)
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {isLoading ? (
              <div className="p-8 text-center text-neutral-400 italic">Loading queries...</div>
            ) : filteredQueries.length === 0 ? (
              <div className="p-8 text-center text-neutral-400 italic">No queries found.</div>
            ) : (
              filteredQueries.map(query => (
                <button
                  key={query.id}
                  onClick={() => setSelectedQuery(query)}
                  className={`w-full text-left p-4 rounded-xl mb-2 transition-all ${
                    selectedQuery?.id === query.id 
                      ? 'bg-igo-green/10 border-igo-green/30' 
                      : 'hover:bg-neutral-50 border-transparent'
                  } border`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-sm text-neutral-800 truncate pr-2">{query.subject}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      query.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {query.status}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mb-2 truncate">{query.message}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-neutral-400 font-medium flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {query.customer_email}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {new Date(query.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Query Details / Reply Panel */}
        <div className="flex-1 bg-white rounded-2xl border border-neutral-200 overflow-hidden flex flex-col">
          {selectedQuery ? (
            <>
              <div className="p-6 border-b border-neutral-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-800 mb-1">{selectedQuery.subject}</h2>
                    <p className="text-sm text-neutral-500 flex items-center gap-2">
                      <User className="w-4 h-4" /> {selectedQuery.customer_email}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    selectedQuery.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {selectedQuery.status}
                  </span>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-neutral-50">
                {/* Customer Message */}
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-neutral-500" />
                  </div>
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-neutral-100 max-w-xl">
                    <p className="text-sm text-neutral-700 whitespace-pre-wrap">{selectedQuery.message}</p>
                    <p className="text-[10px] text-neutral-400 mt-2 font-medium">
                      {new Date(selectedQuery.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Admin Reply (if resolved) */}
                {selectedQuery.status === 'resolved' && selectedQuery.admin_reply && (
                  <div className="flex gap-4 justify-end">
                    <div className="bg-igo-green/10 p-4 rounded-2xl rounded-tr-none shadow-sm border border-igo-green/20 max-w-xl">
                      <p className="text-sm text-neutral-800 whitespace-pre-wrap">{selectedQuery.admin_reply}</p>
                      <p className="text-[10px] text-neutral-500 mt-2 font-medium">
                        {new Date(selectedQuery.updated_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-igo-green flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xs">IGO</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Reply Box */}
              {selectedQuery.status === 'open' && (
                <div className="p-4 bg-white border-t border-neutral-100">
                  <textarea
                    placeholder="Type your reply here... (This will be emailed to the customer)"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={4}
                    className="w-full border border-neutral-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-igo-green/20 focus:border-igo-green outline-none resize-none mb-3"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleReply}
                      disabled={isReplying || !replyText.trim()}
                      className="flex items-center gap-2 px-6 py-2.5 bg-igo-green text-white font-bold rounded-xl hover:bg-[#244a1f] transition-colors disabled:opacity-50"
                    >
                      {isReplying ? (
                        'Sending...'
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Reply & Resolve
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-400">
              <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-medium text-neutral-500">Select a query to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerQueries;
