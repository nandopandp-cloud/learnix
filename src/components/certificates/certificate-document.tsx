import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Path,
  Defs,
  LinearGradient,
  Stop,
  Font,
} from "@react-pdf/renderer";
import { formatDuration } from "@/lib/utils";

const BRAND = "#E50914";

// Fonte cursiva para simular a assinatura manuscrita do instrutor.
// Registrada uma única vez; chamadas repetidas são ignoradas pelo react-pdf.
Font.register({
  family: "Great Vibes",
  src: "/fonts/GreatVibes-Regular.ttf",
});

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#0a0a0a",
    color: "#ffffff",
    fontFamily: "Helvetica",
    padding: 0,
  },
  border: {
    position: "absolute",
    top: 24,
    left: 24,
    right: 24,
    bottom: 24,
    border: "1.5pt solid #E50914",
  },
  content: {
    margin: 48,
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
  },
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
  },
  brandName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 20,
    letterSpacing: 0.5,
  },
  brandRed: { color: BRAND },
  eyebrow: {
    marginTop: 40,
    fontSize: 10,
    letterSpacing: 3,
    color: "#a3a3a3",
    textTransform: "uppercase",
  },
  title: {
    marginTop: 18,
    fontFamily: "Helvetica-Bold",
    fontSize: 30,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 14,
    fontSize: 11,
    color: "#a3a3a3",
    textAlign: "center",
  },
  studentName: {
    marginTop: 22,
    fontFamily: "Helvetica-Bold",
    fontSize: 26,
    color: BRAND,
    textAlign: "center",
  },
  courseIntro: {
    marginTop: 22,
    fontSize: 11,
    color: "#d4d4d4",
    textAlign: "center",
  },
  courseTitle: {
    marginTop: 8,
    fontFamily: "Helvetica-Bold",
    fontSize: 18,
    textAlign: "center",
    maxWidth: 420,
  },
  metaRow: {
    marginTop: 26,
    display: "flex",
    flexDirection: "row",
    gap: 40,
  },
  metaItem: { display: "flex", flexDirection: "column", alignItems: "center" },
  metaLabel: {
    fontSize: 8,
    letterSpacing: 1.5,
    color: "#737373",
    textTransform: "uppercase",
  },
  metaValue: {
    marginTop: 4,
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
  },
  footer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 8,
  },
  signatureBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: 340,
  },
  signatureScript: {
    fontFamily: "Great Vibes",
    color: "#f5f5f5",
    marginBottom: -6,
    textAlign: "center",
  },
  signatureLine: {
    width: "100%",
    borderTop: "1pt solid #525252",
    marginTop: 8,
    marginBottom: 6,
  },
  signatureName: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  signatureRole: { fontSize: 9, color: "#a3a3a3", marginTop: 2 },
  idBlock: { display: "flex", flexDirection: "column", alignItems: "flex-end" },
  idLabel: {
    fontSize: 8,
    color: "#737373",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  idValue: { fontSize: 9, color: "#a3a3a3", marginTop: 3, fontFamily: "Courier" },
});

function LogoMarkPdf() {
  return (
    <Svg width={26} height={26} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="lx" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#FF2A36" />
          <Stop offset="100%" stopColor="#B20710" />
        </LinearGradient>
      </Defs>
      <Path
        d="M14 12h14a8 8 0 0 1 8 8v50h34a8 8 0 0 1 8 8v10H14V12Z"
        fill="url(#lx)"
      />
      <Path d="M40 26 78 48 40 70V26Z" fill="url(#lx)" />
    </Svg>
  );
}

export type CertificateData = {
  studentName: string;
  courseTitle: string;
  instructorName: string;
  totalDuration: number;
  finishedAt: Date;
  certificateId: string;
};

/** Reduz o tamanho da assinatura cursiva conforme o nome cresce, para caber em uma linha. */
function signatureFontSize(name: string) {
  if (name.length <= 14) return 34;
  if (name.length <= 20) return 28;
  if (name.length <= 26) return 23;
  if (name.length <= 32) return 19;
  return Math.max(13, Math.round(19 * (32 / name.length)));
}

/** Certificado de conclusão em A4 paisagem, com a identidade visual da Learnix. */
export function CertificateDocument({ data }: { data: CertificateData }) {
  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(data.finishedAt);

  return (
    <Document
      title={`Certificado - ${data.courseTitle}`}
      author="Learnix"
      subject="Certificado de conclusão de curso"
    >
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.border} />
        <View style={styles.content}>
          <View style={styles.header}>
            <LogoMarkPdf />
            <Text style={styles.brandName}>
              Learn<Text style={styles.brandRed}>ix</Text>
            </Text>
          </View>

          <View style={{ alignItems: "center" }}>
            <Text style={styles.eyebrow}>Certificado de conclusão</Text>
            <Text style={styles.title}>Certificamos que</Text>
            <Text style={styles.studentName}>{data.studentName}</Text>
            <Text style={styles.courseIntro}>
              concluiu com êxito todas as aulas do curso
            </Text>
            <Text style={styles.courseTitle}>{data.courseTitle}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Carga horária</Text>
                <Text style={styles.metaValue}>
                  {formatDuration(data.totalDuration)}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Concluído em</Text>
                <Text style={styles.metaValue}>{formattedDate}</Text>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.signatureBlock}>
              <Text
                wrap={false}
                style={[
                  styles.signatureScript,
                  { fontSize: signatureFontSize(data.instructorName) },
                ]}
              >
                {data.instructorName}
              </Text>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureName}>{data.instructorName}</Text>
              <Text style={styles.signatureRole}>Instrutor do curso</Text>
            </View>

            <View style={styles.idBlock}>
              <Text style={styles.idLabel}>Código de verificação</Text>
              <Text style={styles.idValue}>{data.certificateId}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
