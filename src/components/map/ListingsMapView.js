/**
 * Carte listings — Web (Leaflet / OpenStreetMap).
 * react-native-maps n'est pas supporté sur web.
 */
import { useEffect, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("no document"));
      return;
    }
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (window.L) resolve(window.L);
      else existing.addEventListener("load", () => resolve(window.L));
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function loadCss(href) {
  if (typeof document === "undefined") return;
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

function pinHtml(count, selected) {
  const bg = selected ? colors.navy : colors.primary;
  const size = selected ? 36 : 32;
  return {
    html: `<div style="
      min-width:${size}px;height:${size}px;padding:0 8px;
      border-radius:999px;background:${bg};color:#fff;
      border:2px solid #fff;display:flex;align-items:center;
      justify-content:center;font:700 13px/1 system-ui,sans-serif;
      box-shadow:0 2px 6px rgba(0,0,0,.25);cursor:pointer;
    ">${count > 1 ? count : "•"}</div>`,
    size,
  };
}

export default function ListingsMapView({
  markers = [],
  selectedMarkerId = null,
  onMarkerPress,
  style,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const leafletRef = useRef(null);
  const markersKeyRef = useRef("");
  const onMarkerPressRef = useRef(onMarkerPress);
  const [mapReady, setMapReady] = useState(false);
  onMarkerPressRef.current = onMarkerPress;

  useEffect(() => {
    let cancelled = false;

    async function init() {
      loadCss(LEAFLET_CSS);
      const L = await loadScript(LEAFLET_JS);
      if (cancelled || !containerRef.current || !L) return;
      leafletRef.current = L;

      if (!mapRef.current) {
        const map = L.map(containerRef.current, {
          zoomControl: true,
          attributionControl: true,
        }).setView([36.7538, 3.0588], 10);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap",
          maxZoom: 18,
        }).addTo(map);

        mapRef.current = map;
        layerRef.current = L.layerGroup().addTo(map);
        setTimeout(() => map.invalidateSize(), 80);
      }

      if (!cancelled) setMapReady(true);
    }

    init().catch(() => {});
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        layerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapReady) return;
    const L = leafletRef.current;
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!L || !map || !layer) return;

    const key = markers
      .map((m) => `${m.id}:${m.lat}:${m.lng}:${m.listingCount}`)
      .join("|");
    const markersChanged = key !== markersKeyRef.current;

    layer.clearLayers();

    markers.forEach((marker) => {
      const selected = String(marker.id) === String(selectedMarkerId);
      const count = marker.listingCount ?? 1;
      const { html, size } = pinHtml(count, selected);
      const icon = L.divIcon({
        className: "bi3oo-map-pin",
        html,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
      const m = L.marker([marker.lat, marker.lng], { icon });
      m.on("click", () => onMarkerPressRef.current?.(marker));
      m.addTo(layer);
    });

    if (markersChanged) {
      markersKeyRef.current = key;
      if (markers.length) {
        const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
        map.fitBounds(bounds, { padding: [48, 48], maxZoom: 12 });
      } else {
        map.setView([36.7538, 3.0588], 10);
      }
    } else if (selectedMarkerId) {
      const marker = markers.find(
        (m) => String(m.id) === String(selectedMarkerId)
      );
      if (marker) map.panTo([marker.lat, marker.lng]);
    }

    setTimeout(() => map.invalidateSize(), 40);
  }, [mapReady, markers, selectedMarkerId]);

  return (
    <View style={[styles.root, style]}>
      <div
        ref={containerRef}
        style={{ width: "100%", height: "100%", minHeight: 320 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: "hidden" },
});
