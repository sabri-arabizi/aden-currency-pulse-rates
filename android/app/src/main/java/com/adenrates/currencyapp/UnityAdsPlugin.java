package com.adenrates.currencyapp;

import android.util.Log;
import android.content.Context;
import android.view.View;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.JSObject;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.PluginMethod;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.lang.reflect.InvocationHandler;
import java.util.concurrent.atomic.AtomicBoolean;

@CapacitorPlugin(name = "UnityAds")
public class UnityAdsPlugin extends Plugin {
    private static final String TAG = "UnityAdsPlugin";
    private boolean initialized = false;
    private String gameId = "5967793";

    // Reflection-based Unity Ads integration to avoid compile-time dependency
    private Object unityListener = null;
    private Class<?> unityAdsClass = null;
    private Class<?> unityListenerInterface = null;
    private final AtomicBoolean isShowing = new AtomicBoolean(false);

    private Object createUnityListener() {
        try {
            Log.i(TAG, "createUnityListener: attempting to create unity listener proxy");
            unityListenerInterface = Class.forName("com.unity3d.ads.IUnityAdsListener");
            Object proxy = Proxy.newProxyInstance(unityListenerInterface.getClassLoader(),
                    new Class<?>[] { unityListenerInterface },
                    new InvocationHandler() {
                        @Override
                        public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
                            String name = method.getName();
                            try {
                                if ("onUnityAdsReady".equals(name) && args != null && args.length > 0) {
                                    String placement = String.valueOf(args[0]);
                                    JSObject data = new JSObject();
                                    data.put("placement", placement);
                                    notifyListeners("unityAdsReady", data);
                                } else if ("onUnityAdsStart".equals(name) && args != null && args.length > 0) {
                                    String placement = String.valueOf(args[0]);
                                    JSObject data = new JSObject();
                                    data.put("placement", placement);
                                    notifyListeners("unityAdsStart", data);
                                } else if ("onUnityAdsFinish".equals(name) && args != null) {
                                    String placement = args.length > 0 && args[0] != null ? String.valueOf(args[0])
                                            : "";
                                    String finishState = args.length > 1 && args[1] != null ? args[1].toString() : "";
                                    boolean rewarded = finishState.toUpperCase().contains("COMPLET");
                                    JSObject data = new JSObject();
                                    data.put("placement", placement);
                                    data.put("finishState", finishState);
                                    data.put("rewarded", rewarded);
                                    notifyListeners("unityAdsFinish", data);
                                    // clear showing flag when ad finishes
                                    try {
                                        isShowing.set(false);
                                    } catch (Exception ignore) {
                                    }
                                } else if ("onUnityAdsError".equals(name) && args != null) {
                                    String err = args.length > 0 && args[0] != null ? args[0].toString() : "UNKNOWN";
                                    String msg = args.length > 1 && args[1] != null ? args[1].toString() : "";
                                    JSObject data = new JSObject();
                                    data.put("error", err);
                                    data.put("message", msg);
                                    notifyListeners("unityAdsError", data);
                                    // clear showing flag on error as well
                                    try {
                                        isShowing.set(false);
                                    } catch (Exception ignore) {
                                    }
                                }
                            } catch (Exception e) {
                                Log.w(TAG, "Unity listener proxy handler error", e);
                            }
                            return null;
                        }
                    });
            return proxy;
        } catch (Exception e) {
            Log.w(TAG, "createUnityListener failed", e);
            return null;
        }
    }

    private void ensureUnityClasses() {
        if (unityAdsClass != null)
            return;
        try {
            Log.i(TAG, "ensureUnityClasses: trying to load UnityAds class");
            unityAdsClass = Class.forName("com.unity3d.ads.UnityAds");
            if (unityListener == null) {
                unityListener = createUnityListener();
            }
            try {
                Method addListener = findStaticMethod(unityAdsClass, "addListener", 1);
                if (addListener != null && unityListener != null) {
                    addListener.invoke(null, unityListener);
                    Log.i(TAG, "ensureUnityClasses: addListener invoked");
                }
            } catch (Exception e) {
                Log.w(TAG, "ensureUnityClasses: addListener invoke failed", e);
            }
        } catch (ClassNotFoundException cnfe) {
            Log.w(TAG, "ensureUnityClasses: UnityAds class not found", cnfe);
        } catch (Exception e) {
            Log.w(TAG, "ensureUnityClasses unexpected error", e);
        }
    }

    private Method findStaticMethod(Class<?> cls, String name, int paramCount) {
        for (Method m : cls.getMethods()) {
            if (m.getName().equals(name) && java.lang.reflect.Modifier.isStatic(m.getModifiers())
                    && m.getParameterTypes().length == paramCount) {
                return m;
            }
        }
        return null;
    }

    @PluginMethod
    public void initialize(PluginCall call) {
        String gid = call.getString("gameId", "");
        if (gid == null || gid.isEmpty()) {
            call.reject("Missing gameId");
            return;
        }
        this.gameId = gid;
        final Context context = getContext();
        final View bridgeView = (View) getBridge().getWebView();
        // Do reflection and listener creation off the UI thread to avoid blocking UI.
        new Thread(() -> {
            try {
                try {
                    unityAdsClass = Class.forName("com.unity3d.ads.UnityAds");
                } catch (ClassNotFoundException cnfe) {
                    Log.w(TAG, "UnityAds class not found; dependency may not be resolved yet", cnfe);
                    JSObject err = new JSObject();
                    err.put("message", "UnityAds SDK not found");
                    notifyListeners("unityAdsInitializationFailed", err);
                    call.reject("UnityAds SDK not found", cnfe);
                    return;
                }

                unityListener = createUnityListener();
                // addListener (static) - safe to invoke off UI thread
                try {
                    Method addListener = findStaticMethod(unityAdsClass, "addListener", 1);
                    if (addListener != null && unityListener != null) {
                        addListener.invoke(null, unityListener);
                    }
                } catch (Exception e) {
                    Log.w(TAG, "addListener invoke failed", e);
                }

                // find initialize method (may require Activity). We'll invoke it on UI thread.
                Method initMethod = null;
                for (Method m : unityAdsClass.getMethods()) {
                    if (m.getName().equals("initialize") && m.getParameterTypes().length >= 2) {
                        Class<?> p0 = m.getParameterTypes()[0];
                        Class<?> p1 = m.getParameterTypes()[1];
                        if ((android.app.Activity.class.isAssignableFrom(p0)
                                || android.content.Context.class.isAssignableFrom(p0))
                                && p1 == String.class) {
                            initMethod = m;
                            break;
                        }
                    }
                }

                if (initMethod != null) {
                    final Method toInvoke = initMethod;
                    if (bridgeView != null) {
                        bridgeView.post(() -> {
                            try {
                                Class<?>[] pts = toInvoke.getParameterTypes();
                                Object[] args = new Object[pts.length];
                                args[0] = context;
                                args[1] = gameId;
                                for (int i = 2; i < pts.length; i++) {
                                    if (pts[i] == boolean.class || pts[i] == Boolean.class) {
                                        args[i] = Boolean.FALSE;
                                    } else {
                                        args[i] = null;
                                    }
                                }
                                toInvoke.invoke(null, args);
                            } catch (Exception e) {
                                Log.w(TAG, "invoke initMethod on UI thread failed", e);
                            }
                        });
                    }
                }

                // After attempting init, check isInitialized (off UI thread)
                boolean isInit = false;
                try {
                    Method isInitM = findStaticMethod(unityAdsClass, "isInitialized", 0);
                    if (isInitM != null) {
                        Object ret = isInitM.invoke(null);
                        if (ret instanceof Boolean)
                            isInit = (Boolean) ret;
                    }
                } catch (Exception e) {
                    Log.w(TAG, "isInitialized check failed", e);
                }

                initialized = isInit;
                JSObject res = new JSObject();
                res.put("initialized", initialized);
                notifyListeners("unityAdsInitialized", res);
                call.resolve(res);
            } catch (Exception e) {
                Log.e(TAG, "UnityAds.initialize failed", e);
                JSObject err = new JSObject();
                err.put("message", e.getMessage());
                notifyListeners("unityAdsInitializationFailed", err);
                call.reject("UnityAds initialize error", e);
            }
        }).start();
    }

    private boolean unityIsReady(String placement) {
        if (unityAdsClass == null)
            return false;
        try {
            // try isReady(String)
            for (Method m : unityAdsClass.getMethods()) {
                if (m.getName().equals("isReady") && m.getParameterTypes().length == 1) {
                    Object r = m.invoke(null, placement);
                    if (r instanceof Boolean)
                        return (Boolean) r;
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "unityIsReady failed", e);
        }
        return false;
    }

    @PluginMethod
    public void showInterstitial(PluginCall call) {
        String placement = call.getString("placement", "");
        final Context context = getContext();
        final View bridgeView = (View) getBridge().getWebView();
        // Avoid blocking the UI thread: check readiness in background, then post show
        // to UI thread. Also prevent concurrent show calls.
        new Thread(() -> {
            Log.i(TAG, "showInterstitial: request received placement=" + placement);
            ensureUnityClasses();
            if (isShowing.get()) {
                JSObject d = new JSObject();
                d.put("ready", false);
                d.put("reason", "already_showing");
                call.resolve(d);
                return;
            }

            try {
                boolean ready = false;
                try {
                    if (unityAdsClass == null) {
                        Log.w(TAG, "showInterstitial: UnityAds class not available");
                        JSObject data = new JSObject();
                        data.put("ready", false);
                        data.put("reason", "sdk_not_loaded");
                        notifyListeners("unityAdsShowFailed", data);
                        call.resolve(data);
                        return;
                    }
                    boolean isInit = false;
                    Method isInitM = findStaticMethod(unityAdsClass, "isInitialized", 0);
                    if (isInitM != null) {
                        Object ret = isInitM.invoke(null);
                        if (ret instanceof Boolean)
                            isInit = (Boolean) ret;
                    }
                    ready = isInit && unityIsReady(placement);
                } catch (Exception e) {
                    Log.w(TAG, "ready check failed", e);
                }

                if (ready) {
                    Log.i(TAG, "showInterstitial: ready -> invoking show for placement=" + placement);
                    JSObject req = new JSObject();
                    req.put("placement", placement);
                    notifyListeners("unityAdsShowRequested", req);
                    isShowing.set(true);
                    final String placementFinal = placement;
                    if (bridgeView != null) {
                        bridgeView.post(() -> {
                            try {
                                for (Method m : unityAdsClass.getMethods()) {
                                    if (m.getName().equals("show") && m.getParameterTypes().length >= 1) {
                                        Class<?> p0 = m.getParameterTypes()[0];
                                        try {
                                            if (m.getParameterTypes().length == 2
                                                    && android.app.Activity.class.isAssignableFrom(p0)) {
                                                // prefer invoking show with placement-only if available; otherwise try
                                                // passing context
                                                if (m.getParameterTypes()[0] == String.class) {
                                                    m.invoke(null, placementFinal);
                                                    break;
                                                } else {
                                                    try {
                                                        m.invoke(null, context, placementFinal);
                                                        break;
                                                    } catch (Exception ignore) {
                                                        // fallback: continue searching for other overloads
                                                    }
                                                }
                                            } else if (m.getParameterTypes().length == 1 && p0 == String.class) {
                                                m.invoke(null, placementFinal);
                                                break;
                                            }
                                        } catch (Exception ignore) {
                                        }
                                    }
                                }
                            } catch (Exception e) {
                                Log.e(TAG, "showInterstitial UI invoke error", e);
                            } finally {
                                // We'll clear the flag when the finish event arrives via listener.
                            }
                        });
                    }
                    call.resolve();
                } else {
                    Log.i(TAG, "showInterstitial: not ready for placement=" + placement);
                    JSObject data = new JSObject();
                    data.put("ready", ready);
                    call.resolve(data);
                }
            } catch (Exception e) {
                Log.e(TAG, "showInterstitial error", e);
                call.reject("showInterstitial failed", e);
            }
        }).start();
    }

    @PluginMethod
    public void showRewarded(PluginCall call) {
        String placement = call.getString("placement", "");
        final Context context = getContext();
        final View bridgeView = (View) getBridge().getWebView();
        new Thread(() -> {
            Log.i(TAG, "showRewarded: request received placement=" + placement);
            ensureUnityClasses();
            if (isShowing.get()) {
                JSObject d = new JSObject();
                d.put("ready", false);
                d.put("reason", "already_showing");
                call.resolve(d);
                return;
            }

            try {
                boolean ready = false;
                try {
                    if (unityAdsClass == null) {
                        Log.w(TAG, "showRewarded: UnityAds class not available");
                        JSObject data = new JSObject();
                        data.put("ready", false);
                        data.put("reason", "sdk_not_loaded");
                        notifyListeners("unityAdsShowFailed", data);
                        call.resolve(data);
                        return;
                    }
                    boolean isInit = false;
                    Method isInitM = findStaticMethod(unityAdsClass, "isInitialized", 0);
                    if (isInitM != null) {
                        Object ret = isInitM.invoke(null);
                        if (ret instanceof Boolean)
                            isInit = (Boolean) ret;
                    }
                    ready = isInit && unityIsReady(placement);
                } catch (Exception e) {
                    Log.w(TAG, "ready check failed", e);
                }

                if (ready) {
                    Log.i(TAG, "showRewarded: ready -> invoking show for placement=" + placement);
                    JSObject req = new JSObject();
                    req.put("placement", placement);
                    notifyListeners("unityAdsShowRequested", req);
                    isShowing.set(true);
                    final String placementFinal = placement;
                    if (bridgeView != null) {
                        bridgeView.post(() -> {
                            try {
                                for (Method m : unityAdsClass.getMethods()) {
                                    if (m.getName().equals("show") && m.getParameterTypes().length >= 1) {
                                        Class<?> p0 = m.getParameterTypes()[0];
                                        try {
                                            if (m.getParameterTypes().length == 2
                                                    && android.app.Activity.class.isAssignableFrom(p0)) {
                                                if (m.getParameterTypes()[0] == String.class) {
                                                    m.invoke(null, placementFinal);
                                                    break;
                                                } else {
                                                    try {
                                                        m.invoke(null, context, placementFinal);
                                                        break;
                                                    } catch (Exception ignore) {
                                                    }
                                                }
                                            } else if (m.getParameterTypes().length == 1 && p0 == String.class) {
                                                m.invoke(null, placementFinal);
                                                break;
                                            }
                                        } catch (Exception ignore) {
                                        }
                                    }
                                }
                            } catch (Exception e) {
                                Log.e(TAG, "showRewarded UI invoke error", e);
                            } finally {
                                // cleared when finish event arrives via listener
                            }
                        });
                    }
                    call.resolve();
                } else {
                    Log.i(TAG, "showRewarded: not ready for placement=" + placement);
                    JSObject data = new JSObject();
                    data.put("ready", ready);
                    call.resolve(data);
                }
            } catch (Exception e) {
                Log.e(TAG, "showRewarded error", e);
                call.reject("showRewarded failed", e);
            }
        }).start();
    }

    @PluginMethod
    public void showBanner(PluginCall call) {
        // Banner APIs in Unity Ads are separate. For now, expose a simple adapter that
        // will
        // notify JS; real banner implementation requires using Unity's banner APIs.
        String placement = call.getString("placement", "");
        String position = call.getString("position", "bottom");
        JSObject data = new JSObject();
        data.put("placement", placement);
        data.put("position", position);
        notifyListeners("unityAdsBannerRequested", data);
        call.resolve(data);
    }
}
