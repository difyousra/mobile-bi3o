import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

function Block({ block }) {
  if (block.type === "p") {
    return <Text style={styles.paragraph}>{block.text}</Text>;
  }
  if (block.type === "ul" && Array.isArray(block.items)) {
    return (
      <View style={styles.list}>
        {block.items.map((item, index) => {
          const key =
            typeof item === "string"
              ? `${item.slice(0, 24)}-${index}`
              : `${item.lead ?? "item"}-${index}`;
          return (
            <View key={key} style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              {typeof item === "string" ? (
                <Text style={styles.listText}>{item}</Text>
              ) : (
                <Text style={styles.listText}>
                  <Text style={styles.listLead}>{item.lead} </Text>
                  {item.text}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    );
  }
  if (block.type === "h3" || block.type === "h4") {
    return (
      <Text style={block.type === "h3" ? styles.h3 : styles.h4}>
        {block.text}
      </Text>
    );
  }
  if (block.type === "meta") {
    return (
      <Text style={styles.meta}>
        {block.lead} {block.date}
      </Text>
    );
  }
  if (block.type === "note") {
    return (
      <Text style={styles.note}>
        <Text style={styles.noteLead}>{block.lead} </Text>
        {block.text}
      </Text>
    );
  }
  return null;
}

export default function LegalDocumentBody({ sections, filterId }) {
  const list = filterId
    ? sections.filter((section) => section.id === filterId)
    : sections;

  return (
    <View style={styles.wrap}>
      {list.map((section) => (
        <View
          key={section.id}
          style={[
            styles.section,
            section.variant === "boxed" && styles.boxed,
          ]}
        >
          {section.title ? (
            <Text style={styles.sectionTitle}>{section.title}</Text>
          ) : null}
          {(section.blocks || []).map((block, index) => (
            <Block key={`${section.id}-${index}`} block={block} />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginTop: 22,
  },
  boxed: {
    marginTop: 28,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textHeading,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textHeading,
    marginBottom: 10,
  },
  list: {
    marginBottom: 10,
    gap: 6,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  bullet: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textHeading,
  },
  listText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textHeading,
  },
  listLead: {
    fontWeight: "700",
    color: colors.textHeading,
  },
  h3: {
    marginTop: 14,
    marginBottom: 6,
    fontSize: 16,
    fontWeight: "700",
    color: colors.textHeading,
  },
  h4: {
    marginTop: 12,
    marginBottom: 6,
    fontSize: 15,
    fontWeight: "700",
    color: colors.textHeading,
  },
  meta: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 8,
  },
  note: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    marginVertical: 8,
  },
  noteLead: {
    fontWeight: "700",
    color: colors.textHeading,
  },
});
