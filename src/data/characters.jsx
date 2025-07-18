// src/data/characters.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from "@clerk/clerk-react";

// 커뮤니티 캐릭터 목록을 가져오는 커스텀 훅
export function useCommunityCharacters() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3001/api/communities/characters');
        setCharacters(response.data.data);
      } catch (err) {
        setError('캐릭터 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchCharacters();
  }, []);

  return { characters, loading, error };
}

// 내가 채팅한 캐릭터 목록을 가져오는 커스텀 훅
export function useMyChatCharacters() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchMyChatCharacters = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const response = await fetch("http://localhost:3001/api/my/chat-characters", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('채팅 목록을 불러오는데 실패했습니다.');
        }
        const data = await response.json();
        setCharacters(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyChatCharacters();
  }, [getToken]);

  return { characters, loading, error };
}  