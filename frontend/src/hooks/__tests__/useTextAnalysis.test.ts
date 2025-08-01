/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react'
import { jest } from '@jest/globals'
import useTextAnalysis from '../useTextAnalysis'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

// Mock Supabase
const mockSupabase = {
  auth: {
    getSession: jest.fn(),
  },
}

jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}))

describe('useTextAnalysis', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    mockSupabase.auth.getSession.mockClear()
  })

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useTextAnalysis())

      expect(result.current.text).toBe('')
      expect(result.current.segments).toEqual([])
      expect(result.current.readabilityScore).toBeNull()
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.showUpgradeModal).toBe(false)
    })
  })

  describe('setText functionality', () => {
    it('should update text when setText is called', () => {
      const { result } = renderHook(() => useTextAnalysis())

      act(() => {
        result.current.setText('New text content')
      })

      expect(result.current.text).toBe('New text content')
    })
  })

  describe('analyzeText functionality', () => {
    const mockApiResponse = {
      segments: [
        { type: 'text', content: 'Hello ', suggestions: [] },
        { type: 'jargon', content: 'synergy', suggestions: ['teamwork', 'cooperation'] },
        { type: 'text', content: ' world', suggestions: [] },
      ],
      readability_score: 8.2,
    }

    it('should successfully analyze text with authenticated user', async () => {
      // Mock successful session
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { access_token: 'mock-token' } },
        error: null,
      })

      // Mock successful API response
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      })

      const { result } = renderHook(() => useTextAnalysis())

      await act(async () => {
        await result.current.analyzeText('Hello synergy world')
      })

      expect(result.current.segments).toEqual(mockApiResponse.segments)
      expect(result.current.readabilityScore).toBe(8.2)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should handle API call without authentication', async () => {
      // Mock no session
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      // Mock successful API response
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      })

      const { result } = renderHook(() => useTextAnalysis())

      await act(async () => {
        await result.current.analyzeText('Test text')
      })

      // Should make API call without auth header
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/process',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: 'Test text' }),
        })
      )
    })

    it('should set loading state during API call', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      // Mock delayed response
      let resolvePromise: (value: any) => void
      const delayedPromise = new Promise((resolve) => {
        resolvePromise = resolve
      })

      mockFetch.mockReturnValue(delayedPromise)

      const { result } = renderHook(() => useTextAnalysis())

      // Start analysis
      const analysisPromise = act(async () => {
        await result.current.analyzeText('Test text')
      })

      // Check loading state
      expect(result.current.loading).toBe(true)

      // Resolve the promise
      resolvePromise!({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      })

      await analysisPromise

      expect(result.current.loading).toBe(false)
    })

    it('should handle usage limit errors and show upgrade modal', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      // Mock usage limit error
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
        json: () => Promise.resolve({
          detail: 'You have used your 1 free try. Sign up for more.',
        }),
      })

      const { result } = renderHook(() => useTextAnalysis())

      await act(async () => {
        await result.current.analyzeText('Test text')
      })

      expect(result.current.showUpgradeModal).toBe(true)
      expect(result.current.error).toBeNull() // Should not set error for usage limits
    })

    it('should handle subscription limit errors and show upgrade modal', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { access_token: 'mock-token' } },
        error: null,
      })

      // Mock subscription limit error
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
        json: () => Promise.resolve({
          detail: 'You have used your 2 monthly uses. Upgrade to Pro.',
        }),
      })

      const { result } = renderHook(() => useTextAnalysis())

      await act(async () => {
        await result.current.analyzeText('Test text')
      })

      expect(result.current.showUpgradeModal).toBe(true)
      expect(result.current.error).toBeNull()
    })

    it('should handle API errors correctly', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      // Mock API error
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({
          detail: 'Internal server error',
        }),
      })

      const { result } = renderHook(() => useTextAnalysis())

      await act(async () => {
        await result.current.analyzeText('Test text')
      })

      expect(result.current.error).toBe('Internal server error')
      expect(result.current.loading).toBe(false)
      expect(result.current.showUpgradeModal).toBe(false)
    })

    it('should handle network errors', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      // Mock network error
      mockFetch.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useTextAnalysis())

      await act(async () => {
        await result.current.analyzeText('Test text')
      })

      expect(result.current.error).toBe('Network error')
      expect(result.current.loading).toBe(false)
    })

    it('should handle timeout errors', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      // Mock timeout (AbortError)
      mockFetch.mockRejectedValue(Object.assign(new Error('Aborted'), { name: 'AbortError' }))

      const { result } = renderHook(() => useTextAnalysis())

      await act(async () => {
        await result.current.analyzeText('Test text')
      })

      expect(result.current.error).toBe('Request timed out after 60 seconds. Please try with shorter text.')
      expect(result.current.loading).toBe(false)
    })

    it('should cancel previous requests when new analysis starts', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      const { result } = renderHook(() => useTextAnalysis())

      // Start first request
      const mockAbortController = { abort: jest.fn() }
      global.AbortController = jest.fn(() => mockAbortController) as any

      mockFetch.mockImplementation(() => new Promise(() => {})) // Never resolves

      act(() => {
        result.current.analyzeText('First text')
      })

      // Start second request
      act(() => {
        result.current.analyzeText('Second text')
      })

      // Should have called abort on first request
      expect(mockAbortController.abort).toHaveBeenCalled()
    })

    it('should clear previous results when starting new analysis', async () => {
      const { result } = renderHook(() => useTextAnalysis())

      // Set some initial state
      act(() => {
        result.current.setSegments([{ type: 'text', content: 'old', suggestions: [] }])
      })

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      mockFetch.mockImplementation(() => new Promise(() => {})) // Never resolves

      act(() => {
        result.current.analyzeText('New text')
      })

      // Should clear previous results
      expect(result.current.segments).toEqual([])
      expect(result.current.readabilityScore).toBeNull()
      expect(result.current.error).toBeNull()
      expect(result.current.showUpgradeModal).toBe(false)
    })
  })

  describe('Modal state management', () => {
    it('should allow setting and clearing upgrade modal state', () => {
      const { result } = renderHook(() => useTextAnalysis())

      act(() => {
        result.current.setShowUpgradeModal(true)
      })

      expect(result.current.showUpgradeModal).toBe(true)

      act(() => {
        result.current.setShowUpgradeModal(false)
      })

      expect(result.current.showUpgradeModal).toBe(false)
    })
  })
})