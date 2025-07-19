// src/data/characters.jsx
import { useState, useEffect, useCallback } from 'react';
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

export function useMyCharacters() { // tab is now a parameter
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  const fetchMyCharacters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      const token = await getToken();
      // 'type' is already 'tab' from the hook's parameter
      const response = await fetch(`http://localhost:3001/api/my/characters?type=created`, {
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
  }, [getToken]); // Add tab and getToken to the useCallback dependencies

  useEffect(() => {
    fetchMyCharacters();
  }, [fetchMyCharacters]); // Now fetchMyCharacters is the dependency

  return { characters, loading, error };
}

// 개별 캐릭터 상세 정보를 가져오는 커스텀 훅
export function useCharacterDetail() {
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  const fetchCharacterDetail = useCallback(async (characterId) => {
    if (!characterId) return;
    
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const response = await fetch(`http://localhost:3001/api/my/characters/${characterId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('캐릭터 정보를 불러오는데 실패했습니다.');
      }
      
      const data = await response.json();
      setCharacter(data.data);
      return data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const resetCharacter = useCallback(() => {
    setCharacter(null);
    setError(null);
  }, []);

  return { character, loading, error, fetchCharacterDetail, resetCharacter };
}

// 캐릭터 수정을 위한 커스텀 훅
export function useUpdateCharacter() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  const updateCharacter = useCallback(async (characterId, updateData) => {
    if (!characterId) {
      throw new Error('캐릭터 ID가 필요합니다.');
    }
    
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      
      // API 요청에 맞는 형태로 데이터 구성
      const requestData = {
        introduction: updateData.introduction || updateData.description,
        personality: updateData.personality,
        tone: updateData.tone,
        tag: updateData.tag || updateData.tags
      };
      
      console.log('Updating character with data:', requestData); // 디버깅용
      
      const response = await fetch(`http://localhost:3001/api/my/characters/${characterId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '캐릭터 수정에 실패했습니다.');
      }
      
      const data = await response.json();
      return data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  return { updateCharacter, loading, error };
}

// 캐릭터 삭제를 위한 커스텀 훅
export function useDeleteCharacter() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  const deleteCharacter = useCallback(async (characterId) => {
    if (!characterId) {
      throw new Error('캐릭터 ID가 필요합니다.');
    }
    
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      
      console.log('Deleting character with ID:', characterId); // 디버깅용
      
      const response = await fetch(`http://localhost:3001/api/my/characters/${characterId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '캐릭터 삭제에 실패했습니다.');
      }
      
      const data = await response.json();
      return data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  return { deleteCharacter, loading, error };
}
