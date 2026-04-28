import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const SubscriptionContext = createContext({})

export function SubscriptionProvider({ children }) {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setSubscription(null)
      setLoading(false)
      return
    }

    async function fetchSubscription() {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!error && data) {
        setSubscription(data)
      }
      setLoading(false)
    }

    fetchSubscription()

    // Listen for realtime changes
    const channel = supabase
      .channel('subscription-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'subscriptions',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setSubscription(payload.new)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user])

  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing'
  const isTrialing = subscription?.status === 'trialing'
  const planId = subscription?.plan_id || null

  const createCheckoutSession = async (selectedPlan, selectedPeriod) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const res = await supabase.functions.invoke('create-checkout-session', {
      body: { planId: selectedPlan, period: selectedPeriod },
    })

    if (res.error) throw new Error(res.error.message)
    return res.data.url
  }

  const openPortal = async () => {
    const res = await supabase.functions.invoke('create-portal-session')
    if (res.error) throw new Error(res.error.message)
    window.location.href = res.data.url
  }

  return (
    <SubscriptionContext.Provider value={{
      subscription,
      loading,
      isActive,
      isTrialing,
      planId,
      createCheckoutSession,
      openPortal,
    }}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export const useSubscription = () => useContext(SubscriptionContext)
