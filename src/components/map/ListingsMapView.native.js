/**
 * Carte listings — iOS & Android (react-native-maps).
 * Pins aux locations des annonces / communes.
 */
import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Platform, Linking } from "react-native";
import { colors } from "../../theme/colors";
import { ALGIERS_REGION } from "../../utils/algeriaLocation";
import { useAppLanguage } from "../../i18n/LanguageProvider";

let MapView = null;
let Marker = null;
let PROVIDER_GOOGLE = null;
let mapsAvailable = false;

try {
  // eslint-disable-next-line global-require
  const maps = require("react-native-maps");
  MapView = maps.default;
  Marker = maps.Marker;
  PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
  mapsAvailable = Boolean(MapView);
} catch {
  mapsAvailable = false;
}

function regionFromMarkers(markers) {
  if (!markers?.length) return ALGIERS_REGION;

  let minLat = markers[0].lat;
  let maxLat = markers[0].lat;
  let minLng = markers[0].lng;
  let maxLng = markers[0].lng;

  markers.forEach((m) => {
    minLat = Math.min(minLat, m.lat);
    maxLat = Math.max(maxLat, m.lat);
    minLng = Math.min(minLng, m.lng);
    maxLng = Math.max(maxLng, m.lng);
  });

  const midLat = (minLat + maxLat) / 2;
  const midLng = (minLng + maxLng) / 2;
  const latDelta = Math.max((maxLat - minLat) * 1.4, 0.08);
  const lngDelta = Math.max((maxLng - minLng) * 1.4, 0.08);

  return {
    latitude: midLat,
    longitude: midLng,
    latitudeDelta: latDelta,
    longitudeDelta: lngDelta,
  };
}

function MapsUnavailableFallback({ markers = [] }) {
  const { t } = useAppLanguage();
  const first = markers[0];
  const openExternal = () => {
    if (!first) return;
    const url =
      Platform.OS === "ios"
        ? `http://maps.apple.com/?ll=${first.lat},${first.lng}`
        : `https://www.google.com/maps/search/?api=1&query=${first.lat},${first.lng}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={[styles.root, styles.fallback]}>
      <Text style={styles.fallbackTitle}>{t("mobile.map.unavailableTitle")}</Text>
      <Text style={styles.fallbackText}>{t("mobile.map.expoGoHint")}</Text>
      {first ? (
        <Text style={styles.fallbackLink} onPress={openExternal}>
          {t("mobile.product.openInMaps")}
        </Text>
      ) : null}
    </View>
  );
}

export default function ListingsMapView({
  markers = [],
  selectedMarkerId = null,
  onMarkerPress,
  style,
}) {
  const mapRef = useRef(null);
  const initialRegion = regionFromMarkers(markers);

  useEffect(() => {
    if (!mapsAvailable || !mapRef.current || !markers.length) return;
    const coords = markers.map((m) => ({
      latitude: m.lat,
      longitude: m.lng,
    }));
    try {
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 80, right: 40, bottom: 220, left: 40 },
        animated: true,
      });
    } catch {
      /* ignore fit errors on first mount */
    }
  }, [markers]);

  useEffect(() => {
    if (!mapsAvailable || !mapRef.current || !selectedMarkerId) return;
    const marker = markers.find((m) => String(m.id) === String(selectedMarkerId));
    if (!marker) return;
    mapRef.current.animateToRegion(
      {
        latitude: marker.lat,
        longitude: marker.lng,
        latitudeDelta: 0.12,
        longitudeDelta: 0.12,
      },
      280
    );
  }, [selectedMarkerId, markers]);

  if (!mapsAvailable) {
    return <MapsUnavailableFallback markers={markers} />;
  }

  return (
    <View style={[styles.root, style]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        initialRegion={initialRegion}
        showsUserLocation={false}
        showsCompass={false}
        toolbarEnabled={false}
      >
        {markers.map((marker) => {
          const selected = String(marker.id) === String(selectedMarkerId);
          const count = marker.listingCount ?? 1;
          return (
            <Marker
              key={String(marker.id)}
              coordinate={{ latitude: marker.lat, longitude: marker.lng }}
              title={marker.label}
              onPress={() => onMarkerPress?.(marker)}
              tracksViewChanges={false}
            >
              <View style={[styles.pin, selected && styles.pinSelected]}>
                <Text style={styles.pinText}>{count > 1 ? count : "•"}</Text>
              </View>
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  fallback: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: colors.background,
  },
  fallbackTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textHeading,
    marginBottom: 8,
  },
  fallbackText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: 12,
  },
  fallbackLink: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  pin: {
    minWidth: 32,
    height: 32,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  pinSelected: {
    backgroundColor: colors.navy,
    transform: [{ scale: 1.15 }],
  },
  pinText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "700",
  },
});
