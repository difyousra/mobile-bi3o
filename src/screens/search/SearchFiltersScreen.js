import { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Modal,
  FlatList,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { DEFAULT_SEARCH_FILTERS } from "../../data/searchFilters";
import { useCategoryChips, useSousCategories } from "../../hooks/useCatalog";
import {
  useReferentielMarquesModeles,
  useSubcategoryAttributs,
} from "../../hooks/useSubcategoryAttributs";
import {
  getMarquesList,
  getModelesForMarque,
  getDynamicModeleField,
} from "../../features/annonces/utils/taxoHelpers";
import {
  getFilterSchema,
  hasDynamicFilters,
  getDynamicFiltersLabel,
} from "../../features/filters/categoryFilterSchemas";
import {
  resolveImmobilierLinkageProfile,
} from "../../features/filters/immobilierFilterAttributes";
import { isFilterFieldVisible } from "../../features/filters/filterSchemaRuntime";
import { buildSchemaSearchPayload, countActiveSchemaFilters } from "../../features/filters/buildSchemaSearchPayload";

/* ─── Composants de rendu de champ ─────────────────────────────────────────── */

function RangeField({ field, filters, onChange }) {
  const minKey = field.minParam || 'min';
  const maxKey = field.maxParam || 'max';
  return (
    <View style={fStyles.rangeRow}>
      <View style={fStyles.rangeField}>
        <Text style={fStyles.rangeLabel}>Min {field.currency ? `(${field.currency})` : ''}</Text>
        <TextInput
          style={fStyles.rangeInput}
          value={String(filters[minKey] || '')}
          onChangeText={(v) => onChange({ [minKey]: v })}
          placeholder="0"
          placeholderTextColor={colors.placeholder}
          keyboardType="numeric"
        />
      </View>
      <View style={fStyles.rangeField}>
        <Text style={fStyles.rangeLabel}>Max {field.currency ? `(${field.currency})` : ''}</Text>
        <TextInput
          style={fStyles.rangeInput}
          value={String(filters[maxKey] || '')}
          onChangeText={(v) => onChange({ [maxKey]: v })}
          placeholder="∞"
          placeholderTextColor={colors.placeholder}
          keyboardType="numeric"
        />
      </View>
    </View>
  );
}

/** Plage de dates ISO (AAAA-MM-JJ) — aligné new front FilterDateRangeField. */
function DateRangeField({ field, filters, onChange }) {
  const minKey = field.minParam || 'min';
  const maxKey = field.maxParam || 'max';
  const webDateProps =
    Platform.OS === 'web'
      ? { type: 'date' }
      : { placeholder: 'AAAA-MM-JJ', placeholderTextColor: colors.placeholder };

  return (
    <View>
      {field.hint ? <Text style={fStyles.hint}>{field.hint}</Text> : null}
      <View style={fStyles.rangeRow}>
        <View style={fStyles.rangeField}>
          <Text style={fStyles.rangeLabel}>Arrivée</Text>
          <TextInput
            style={fStyles.rangeInput}
            value={String(filters[minKey] || '')}
            onChangeText={(v) => onChange({ [minKey]: v })}
            {...webDateProps}
          />
        </View>
        <View style={fStyles.rangeField}>
          <Text style={fStyles.rangeLabel}>Départ</Text>
          <TextInput
            style={fStyles.rangeInput}
            value={String(filters[maxKey] || '')}
            onChangeText={(v) => onChange({ [maxKey]: v })}
            {...webDateProps}
          />
        </View>
      </View>
    </View>
  );
}

function ButtonsField({ field, filters, onChange }) {
  const paramKey = field.param || field.id;
  const current = filters[paramKey];
  const isMulti = field.selectionMode === 'multi';

  const isSelected = (val) => {
    if (isMulti && Array.isArray(current)) return current.includes(val);
    return current === val;
  };

  const toggle = (val) => {
    if (isMulti) {
      const arr = Array.isArray(current) ? [...current] : [];
      const idx = arr.indexOf(val);
      if (idx >= 0) arr.splice(idx, 1);
      else arr.push(val);
      onChange({ [paramKey]: arr });
    } else {
      onChange({ [paramKey]: current === val ? '' : val });
    }
  };

  return (
    <View style={fStyles.btnRow}>
      {field.options.map((opt) => {
        const val = opt.value ?? opt;
        const label = opt.label ?? opt;
        const active = isSelected(val);
        return (
          <TouchableOpacity
            key={val}
            style={[fStyles.btn, active && fStyles.btnActive]}
            onPress={() => toggle(val)}
          >
            <Text style={[fStyles.btnText, active && fStyles.btnTextActive]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function SegmentedField({ field, filters, onChange }) {
  const paramKey = field.param || field.id;
  const current = filters[paramKey];
  const isMulti = field.selectionMode === 'multi';

  const isSelected = (val) => {
    if (val === 'Any') return !current || (Array.isArray(current) && !current.length);
    if (isMulti && Array.isArray(current)) return current.includes(val);
    return current === val;
  };

  const toggle = (val) => {
    if (val === 'Any') {
      onChange({ [paramKey]: isMulti ? [] : '' });
      return;
    }
    if (isMulti) {
      const arr = Array.isArray(current) ? [...current] : [];
      const idx = arr.indexOf(val);
      if (idx >= 0) arr.splice(idx, 1);
      else arr.push(val);
      onChange({ [paramKey]: arr });
    } else {
      onChange({ [paramKey]: current === val ? '' : val });
    }
  };

  return (
    <View style={fStyles.segRow}>
      {field.options.map((opt) => {
        const val = opt?.value ?? opt;
        const label = opt?.label ?? opt;
        const active = isSelected(val);
        return (
          <TouchableOpacity
            key={val}
            style={[fStyles.seg, active && fStyles.segActive]}
            onPress={() => toggle(val)}
          >
            <Text style={[fStyles.segText, active && fStyles.segTextActive]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function TagsField({ field, filters, onChange }) {
  const paramKey = field.param || field.id;
  const current = filters[paramKey];
  const arr = Array.isArray(current) ? current : [];

  const toggle = (val) => {
    const idx = arr.indexOf(val);
    const next = [...arr];
    if (idx >= 0) next.splice(idx, 1);
    else next.push(val);
    onChange({ [paramKey]: next });
  };

  return (
    <View style={fStyles.tagsRow}>
      {field.options.map((opt) => {
        const val = opt?.value ?? opt;
        const label = opt?.label ?? opt;
        const active = arr.includes(val);
        return (
          <TouchableOpacity
            key={val}
            style={[fStyles.tag, active && fStyles.tagActive]}
            onPress={() => toggle(val)}
          >
            <Text style={[fStyles.tagText, active && fStyles.tagTextActive]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function SelectField({ field, filters, onChange }) {
  const paramKey = field.param || field.id;
  const current = filters[paramKey];
  const [open, setOpen] = useState(false);

  return (
    <View>
      <TouchableOpacity
        style={fStyles.selectRow}
        onPress={() => setOpen((v) => !v)}
      >
        <Text style={current ? fStyles.selectValue : fStyles.selectPlaceholder}>
          {current || field.placeholder || 'Sélectionner'}
        </Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
      </TouchableOpacity>
      {open && (
        <View style={fStyles.selectBox}>
          <TouchableOpacity
            style={[fStyles.selectOpt, !current && fStyles.selectOptActive]}
            onPress={() => { onChange({ [paramKey]: '' }); setOpen(false); }}
          >
            <Text style={[fStyles.selectOptText, !current && fStyles.selectOptTextActive]}>
              {field.placeholder || 'Toutes'}
            </Text>
          </TouchableOpacity>
          {field.options.map((opt) => {
            const val = opt?.value ?? opt;
            const label = opt?.label ?? opt;
            const active = current === val;
            return (
              <TouchableOpacity
                key={val}
                style={[fStyles.selectOpt, active && fStyles.selectOptActive]}
                onPress={() => { onChange({ [paramKey]: val }); setOpen(false); }}
              >
                <Text style={[fStyles.selectOptText, active && fStyles.selectOptTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

/* ─── Champs spéciaux véhicule ──────────────────────────────────────────────── */

function VehicleBrandField({ field, filters, onChange }) {
  const { data: referentiel, isLoading } = useReferentielMarquesModeles(true);
  const paramKey = field.param || field.id;

  const options = useMemo(() => {
    const fromReferentiel = getMarquesList(referentiel);
    if (fromReferentiel.length) return fromReferentiel.map((v) => ({ value: v, label: v }));
    return field.options || [];
  }, [referentiel, field.options]);

  const syntheticField = { ...field, type: 'select', options, placeholder: isLoading && !options.length ? 'Chargement…' : (field.placeholder || 'Toutes les marques') };
  return <SelectField field={syntheticField} filters={filters} onChange={(patch) => {
    // Effacer le modèle si la marque change
    onChange({ ...patch, model: '' });
  }} />;
}

function VehicleModelField({ field, filters, onChange }) {
  const brand = filters[field.dependsOn || 'brand'] || '';
  const { data: taxoAttributs = [], isLoading: taxoLoading } = useSubcategoryAttributs(
    brand ? field.sousCategorieId : null
  );
  const { data: referentiel, isLoading: refLoading } = useReferentielMarquesModeles(
    Boolean(brand) && Number(field.sousCategorieId) === 1
  );

  const options = useMemo(() => {
    if (!brand) return [];
    if (Number(field.sousCategorieId) === 1 && referentiel) {
      const fromRef = getModelesForMarque(referentiel, brand);
      if (fromRef.length) return fromRef.map((v) => ({ value: v, label: v }));
    }
    const dynamic = getDynamicModeleField(taxoAttributs, brand, field?.api?.attributeId ?? null);
    return (dynamic.options || []).map((v) => ({ value: v, label: v }));
  }, [brand, taxoAttributs, referentiel, field.sousCategorieId, field?.api?.attributeId]);

  const isLoading = taxoLoading || refLoading;
  const placeholder = !brand
    ? 'Sélectionnez d\'abord une marque'
    : isLoading ? 'Chargement des modèles…'
    : options.length ? 'Tous les modèles'
    : 'Aucun modèle disponible';

  const syntheticField = { ...field, type: 'select', options, placeholder };
  return <SelectField field={syntheticField} filters={filters} onChange={onChange} />;
}

function FilterField({ field, filters, onChange }) {
  if (field.type === 'dateRange') return <DateRangeField field={field} filters={filters} onChange={onChange} />;
  if (field.type === 'range') return <RangeField field={field} filters={filters} onChange={onChange} />;
  if (field.type === 'buttons') return <ButtonsField field={field} filters={filters} onChange={onChange} />;
  if (field.type === 'segmented') return <SegmentedField field={field} filters={filters} onChange={onChange} />;
  if (field.type === 'tags') return <TagsField field={field} filters={filters} onChange={onChange} />;
  if (field.type === 'select') return <SelectField field={field} filters={filters} onChange={onChange} />;
  if (field.type === 'vehicleBrand') return <VehicleBrandField field={field} filters={filters} onChange={onChange} />;
  if (field.type === 'vehicleModel') return <VehicleModelField field={field} filters={filters} onChange={onChange} />;
  return null;
}

/* ─── Section de filtre avec titre ─────────────────────────────────────────── */

function FilterSection({ field, filters, onChange }) {
  return (
    <View style={styles.filterSection}>
      <Text style={styles.filterLabel}>{field.label}</Text>
      <FilterField field={field} filters={filters} onChange={onChange} />
    </View>
  );
}

/* ─── Picker catégorie 2 étapes (modal) ─────────────────────────────────────── */

function CategoryPicker({ visible, onClose, onSelect, categories, sousCategories, currentCategorieId, currentSousCategorieId }) {
  const [step, setStep] = useState(1); // 1 = choix catégorie, 2 = choix sous-catégorie
  const [selectedCat, setSelectedCat] = useState(null);

  const handleOpenModal = () => {
    setStep(1);
    setSelectedCat(currentCategorieId ? categories.find((c) => Number(c.rawId) === Number(currentCategorieId)) : null);
  };

  // Réinitialiser à l'ouverture
  useMemo(() => { if (visible) handleOpenModal(); }, [visible]);

  const sousForCat = useMemo(() => {
    if (!selectedCat) return [];
    return sousCategories.filter((s) => Number(s.categorieId) === Number(selectedCat.rawId));
  }, [selectedCat, sousCategories]);

  const handleSelectCat = (cat) => {
    setSelectedCat(cat);
    const sous = sousCategories.filter((s) => Number(s.categorieId) === Number(cat.rawId));
    if (sous.length === 0) {
      // Pas de sous-catégorie → appliquer directement
      onSelect({ categorieId: cat.rawId, sousCategorieId: null });
      onClose();
    } else {
      setStep(2);
    }
  };

  const handleSelectSous = (sc) => {
    onSelect({ categorieId: sc.categorieId ?? selectedCat?.rawId, sousCategorieId: sc.id });
    onClose();
  };

  const handleReset = () => {
    onSelect({ categorieId: null, sousCategorieId: null });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={picker.safe} edges={['top']}>
        <View style={picker.header}>
          {step === 2 ? (
            <TouchableOpacity onPress={() => setStep(1)}>
              <Ionicons name="arrow-back" size={22} color={colors.textHeading} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.textHeading} />
            </TouchableOpacity>
          )}
          <Text style={picker.title}>
            {step === 1 ? 'Choisir une catégorie' : selectedCat?.label ?? 'Sous-catégorie'}
          </Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={picker.reset}>Effacer</Text>
          </TouchableOpacity>
        </View>

        {step === 1 ? (
          <FlatList
            data={categories}
            keyExtractor={(c) => String(c.id)}
            contentContainerStyle={picker.list}
            renderItem={({ item }) => {
              const active = Number(currentCategorieId) === Number(item.rawId) && !currentSousCategorieId;
              const hasSous = sousCategories.some((s) => Number(s.categorieId) === Number(item.rawId));
              return (
                <TouchableOpacity
                  style={[picker.row, active && picker.rowActive]}
                  onPress={() => handleSelectCat(item)}
                >
                  <Text style={[picker.rowText, active && picker.rowTextActive]}>{item.label}</Text>
                  {hasSous && <Ionicons name="chevron-forward" size={16} color={active ? colors.primary : colors.textMuted} />}
                  {active && !hasSous && <Ionicons name="checkmark" size={16} color={colors.primary} />}
                </TouchableOpacity>
              );
            }}
          />
        ) : (
          <FlatList
            data={sousForCat}
            keyExtractor={(s) => String(s.id)}
            contentContainerStyle={picker.list}
            ListHeaderComponent={
              <TouchableOpacity
                style={[picker.row, !currentSousCategorieId && Number(currentCategorieId) === Number(selectedCat?.rawId) && picker.rowActive]}
                onPress={() => { onSelect({ categorieId: selectedCat.rawId, sousCategorieId: null }); onClose(); }}
              >
                <Text style={picker.rowText}>Toutes les {selectedCat?.label}</Text>
              </TouchableOpacity>
            }
            renderItem={({ item }) => {
              const active = Number(currentSousCategorieId) === Number(item.id);
              return (
                <TouchableOpacity
                  style={[picker.row, active && picker.rowActive]}
                  onPress={() => handleSelectSous(item)}
                >
                  <Text style={[picker.rowText, active && picker.rowTextActive]}>{item.nom}</Text>
                  {active && <Ionicons name="checkmark" size={16} color={colors.primary} />}
                </TouchableOpacity>
              );
            }}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const picker = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  title: { fontSize: 17, fontWeight: '700', color: colors.textHeading },
  reset: { fontSize: 14, fontWeight: '600', color: colors.primary },
  list: { paddingBottom: 32 },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  rowActive: { backgroundColor: '#FFF0F2' },
  rowText: { fontSize: 15, color: colors.textHeading, flex: 1 },
  rowTextActive: { color: colors.primary, fontWeight: '600' },
});

/* ─── Écran principal ───────────────────────────────────────────────────────── */

export default function SearchFiltersScreen({ navigation, route }) {
  const initial = route.params?.filters ?? DEFAULT_SEARCH_FILTERS;
  const [location, setLocation] = useState(initial.location ?? "Toute l'Algérie");
  const [categorieId, setCategorieId] = useState(initial.categorieId ?? null);
  const [sousCategorieId, setSousCategorieId] = useState(initial.sousCategorieId ?? null);

  // Filtres généraux
  const [priceMin, setPriceMin] = useState(initial.priceMin ?? '');
  const [priceMax, setPriceMax] = useState(initial.priceMax ?? '');
  const [annonceType, setAnnonceType] = useState(initial.annonceType ?? '');

  // Filtres dynamiques (immobilier, véhicule, électronique…) — objet plat
  const [dynFilters, setDynFilters] = useState(initial.dynFilters ?? {});

  const [catPickerVisible, setCatPickerVisible] = useState(false);
  const { chips, isLoading: taxoLoading } = useCategoryChips();
  const { data: sousCategories = [], isLoading: sousLoading } = useSousCategories();

  // Attributs taxo de la sous-catégorie (options dynamiques emploi / formation / candidature)
  const { data: taxoAttributs = [] } = useSubcategoryAttributs(sousCategorieId);

  const categories = useMemo(() => chips.filter((c) => c.id !== 'all'), [chips]);

  // Schéma dynamique selon catégorie/sous-catégorie (dispatcher central)
  const dynSchema = useMemo(
    () => getFilterSchema({ categorieId, sousCategorieId, taxoAttributs }) ?? [],
    [categorieId, sousCategorieId, taxoAttributs]
  );

  const updateDynFilter = useCallback(
    (patch) => {
      setDynFilters((prev) => {
        const next = { ...prev, ...patch };
        // clearsOnChange : vider les champs dépendants (ex. marque → modèle)
        for (const field of dynSchema) {
          const key = field.param || field.id;
          if (!(key in patch) || !field.clearsOnChange?.length) continue;
          field.clearsOnChange.forEach((child) => {
            const prevVal = prev[child];
            next[child] = Array.isArray(prevVal) ? [] : '';
          });
        }
        return next;
      });
    },
    [dynSchema]
  );

  const hasDyn = hasDynamicFilters({ categorieId, sousCategorieId });
  const dynLabel = getDynamicFiltersLabel({ categorieId, sousCategorieId });
  // Emploi : salaire remplace le prix générique (comme le web)
  const hasSalaryField = dynSchema.some((f) => f.id === 'salary');

  // Linkage immobilier : filtres conditionnels selon type de bien sélectionné
  const linkageProfile = resolveImmobilierLinkageProfile(sousCategorieId);

  const visibleDynFields = useMemo(() => {
    return dynSchema.filter((field) => {
      if (field.id === 'price') return false; // géré séparément
      return isFilterFieldVisible(field, dynFilters, {
        linkageProfile,
        linkageSourceField: 'propertyType',
      });
    });
  }, [dynSchema, dynFilters, linkageProfile]);

  // Label affiché sur le bouton catégorie
  const catLabel = useMemo(() => {
    if (sousCategorieId) {
      const sc = sousCategories.find((s) => Number(s.id) === Number(sousCategorieId));
      const cat = categories.find((c) => Number(c.rawId) === Number(categorieId));
      if (sc) return `${cat?.label ?? ''} › ${sc.nom}`.trim().replace(/^› /, '');
    }
    if (categorieId) {
      return categories.find((c) => Number(c.rawId) === Number(categorieId))?.label ?? 'Catégorie';
    }
    return null;
  }, [categorieId, sousCategorieId, categories, sousCategories]);

  const handleReset = () => {
    setLocation("Toute l'Algérie");
    setCategorieId(null);
    setSousCategorieId(null);
    setPriceMin('');
    setPriceMax('');
    setAnnonceType('');
    setDynFilters({});
  };

  const handleApply = () => {
    const apiPayload = dynSchema.length
      ? buildSchemaSearchPayload({ ...dynFilters, priceMin, priceMax }, dynSchema)
      : {};

    navigation.navigate({
      name: 'Search',
      params: {
        initialQuery: route.params?.searchQuery ?? '',
        filters: {
          location,
          categorieId,
          sousCategorieId,
          annonceType,
          attributs: apiPayload.attributs ?? [],
          prixMin: apiPayload.prixMin ?? (priceMin ? Number(priceMin) : null),
          prixMax: apiPayload.prixMax ?? (priceMax ? Number(priceMax) : null),
          type: apiPayload.type ?? (annonceType || null),
          disponibiliteDateArrivee: apiPayload.disponibiliteDateArrivee ?? null,
          disponibiliteDateDepart: apiPayload.disponibiliteDateDepart ?? null,
          dynFilters, // pour conserver l'état dans le formulaire
        },
      },
      merge: true,
    });
  };

  const dynFilterCount = countActiveSchemaFilters(
    { ...dynFilters, priceMin, priceMax },
    dynSchema
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textHeading} />
        </TouchableOpacity>
        <Text style={styles.title}>Filtres{dynFilterCount > 0 ? ` (${dynFilterCount})` : ''}</Text>
        <TouchableOpacity onPress={handleReset}>
          <Text style={styles.resetText}>Réinitialiser</Text>
        </TouchableOpacity>
      </View>

      <CategoryPicker
        visible={catPickerVisible}
        onClose={() => setCatPickerVisible(false)}
        onSelect={({ categorieId: cid, sousCategorieId: sid }) => {
          setCategorieId(cid);
          setSousCategorieId(sid);
          setDynFilters({});
        }}
        categories={categories}
        sousCategories={sousCategories}
        currentCategorieId={categorieId}
        currentSousCategorieId={sousCategorieId}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Catégorie — bouton picker 2 étapes */}
        <Text style={styles.sectionTitle}>Catégorie</Text>
        {taxoLoading || sousLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginBottom: 12 }} />
        ) : (
          <TouchableOpacity
            style={styles.pickerBtn}
            onPress={() => setCatPickerVisible(true)}
          >
            <View style={{ flex: 1 }}>
              {catLabel ? (
                <Text style={styles.pickerBtnValue}>{catLabel}</Text>
              ) : (
                <Text style={styles.pickerBtnPlaceholder}>Toutes les catégories</Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
        {catLabel ? (
          <TouchableOpacity
            style={styles.clearCatBtn}
            onPress={() => { setCategorieId(null); setSousCategorieId(null); setDynFilters({}); }}
          >
            <Ionicons name="close-circle" size={16} color={colors.textMuted} />
            <Text style={styles.clearCatText}>Effacer la catégorie</Text>
          </TouchableOpacity>
        ) : null}

        {/* Type d'annonce */}
        <Text style={styles.sectionTitle}>Type d'annonce</Text>
        <View style={fStyles.btnRow}>
          {[{ value: '', label: 'Toutes' }, { value: 'OFFRE', label: 'Offre' }, { value: 'DEMANDE', label: 'Demande' }].map(({ value, label }) => (
            <TouchableOpacity
              key={value}
              style={[fStyles.btn, annonceType === value && fStyles.btnActive]}
              onPress={() => setAnnonceType(value)}
            >
              <Text style={[fStyles.btnText, annonceType === value && fStyles.btnTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Prix — masqué pour Emploi (remplacé par Salaire dans les critères) */}
        {!hasSalaryField ? (
          <>
            <Text style={styles.sectionTitle}>Prix</Text>
            <View style={fStyles.rangeRow}>
              <View style={fStyles.rangeField}>
                <Text style={fStyles.rangeLabel}>Min (Da)</Text>
                <TextInput
                  style={fStyles.rangeInput}
                  value={priceMin}
                  onChangeText={setPriceMin}
                  placeholder="0"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="numeric"
                />
              </View>
              <View style={fStyles.rangeField}>
                <Text style={fStyles.rangeLabel}>Max (Da)</Text>
                <TextInput
                  style={fStyles.rangeInput}
                  value={priceMax}
                  onChangeText={setPriceMax}
                  placeholder="∞"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </>
        ) : null}

        {/* Filtres dynamiques (véhicule, immobilier…) */}
        {hasDyn && visibleDynFields.length > 0 && (
          <>
            <View style={styles.immoDivider}>
              <Text style={styles.immoLabel}>{dynLabel}</Text>
            </View>
            {visibleDynFields.map((field) => (
              <FilterSection
                key={field.id}
                field={field}
                filters={dynFilters}
                onChange={updateDynFilter}
              />
            ))}
          </>
        )}

      </ScrollView>

      <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
        <Text style={styles.applyText}>Afficher les résultats</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

/* ─── Styles ────────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.textHeading },
  resetText: { fontSize: 14, fontWeight: '600', color: colors.primary },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 32 },
  sectionTitle: {
    fontSize: 15, fontWeight: '700', color: colors.textHeading,
    marginBottom: 10, marginTop: 16,
  },
  pickerBtn: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: colors.white,
  },
  pickerBtnValue: { fontSize: 15, color: colors.textHeading, fontWeight: '600' },
  pickerBtnPlaceholder: { fontSize: 15, color: colors.textMuted },
  clearCatBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 8, alignSelf: 'flex-start',
  },
  clearCatText: { fontSize: 13, color: colors.textMuted },
  immoDivider: {
    marginTop: 24, marginBottom: 4,
    borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16,
  },
  immoLabel: { fontSize: 16, fontWeight: '700', color: colors.textHeading },
  filterSection: { marginTop: 16 },
  filterLabel: { fontSize: 13, fontWeight: '600', color: colors.textMuted, marginBottom: 8 },
  applyBtn: {
    margin: 20, height: 52, borderRadius: 10,
    backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center',
  },
  applyText: { fontSize: 16, fontWeight: '600', color: colors.white },
});

const fStyles = StyleSheet.create({
  rangeRow: { flexDirection: 'row', gap: 12 },
  rangeField: { flex: 1 },
  rangeLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 4 },
  hint: { fontSize: 12, color: colors.textMuted, marginBottom: 8 },
  rangeInput: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: colors.textHeading,
  },
  btnRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  btn: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 8,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white,
  },
  btnActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  btnText: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
  btnTextActive: { color: colors.white, fontWeight: '700' },
  segRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  seg: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white,
    minWidth: 40, alignItems: 'center',
  },
  segActive: { borderColor: colors.navy, backgroundColor: colors.navy },
  segText: { fontSize: 13, color: colors.textMuted },
  segTextActive: { color: colors.white, fontWeight: '700' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 6,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white,
  },
  tagActive: { borderColor: colors.primary, backgroundColor: '#FFF0F2' },
  tagText: { fontSize: 13, color: colors.textMuted },
  tagTextActive: { color: colors.primary, fontWeight: '600' },
  selectRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: colors.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 13,
  },
  selectValue: { fontSize: 14, color: colors.textHeading },
  selectPlaceholder: { fontSize: 14, color: colors.textMuted },
  selectBox: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 10,
    marginTop: 4, overflow: 'hidden',
  },
  selectOpt: {
    paddingHorizontal: 14, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  selectOptActive: { backgroundColor: 'rgba(201,0,23,0.06)' },
  selectOptText: { fontSize: 14, color: colors.textHeading },
  selectOptTextActive: { color: colors.primary, fontWeight: '600' },
});
