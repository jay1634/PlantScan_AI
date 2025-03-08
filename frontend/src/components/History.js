import React, { useEffect, useState } from 'react';
import { firestore } from '//firebase';

const History = ({ user }) => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (user) {
            const userHistoryRef = firestore.collection('users').doc(user.uid).collection('history');
            userHistoryRef.orderBy('timestamp', 'desc').onSnapshot(snapshot => {
                const historyData = snapshot.docs.map(doc => doc.data());
                setHistory(historyData);
            });
        }
    }, [user]);

    return (
        <div className="history-container">
            <h2>Detection History</h2>
            {history.map((entry, index) => (
                <div key={index} className="history-entry">
                    <h3>{entry.result.disease_name}</h3>
                    <p>{entry.result.description}</p>
                    <p>Detected on: {new Date(entry.timestamp?.toDate()).toLocaleString()}</p>
                </div>
            ))}
        </div>
    );
};

export default History;