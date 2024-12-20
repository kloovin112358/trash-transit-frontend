import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const PrivacyPolicy = () => {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.heading}>Privacy Policy for Trash Transit</Text>
        <Text style={styles.text}>Effective Date: December 19, 2024</Text>

        <Text style={styles.subheading}>Introduction</Text>
        <Text style={styles.text}>
          Welcome to Trash Transit! Your privacy is important to us. This Privacy Policy explains how we collect,
          use, and share information submitted through our mobile app, available on iOS and Android platforms.
          By using Trash Transit, you agree to the practices described in this Privacy Policy.
        </Text>

        <Text style={styles.subheading}>Information We Collect</Text>
        <Text style={styles.text}>
          Trash Transit does not collect any personal information or create user accounts. All data submitted
          through the app is:
        </Text>
        <Text style={styles.bullet}>1. <Text style={styles.bold}>Voluntarily Provided</Text>: Users may submit comments or report the time they waited for a bus or train in their respective city.</Text>
        <Text style={styles.bullet}>2. <Text style={styles.bold}>Anonymized</Text>: Submissions are not linked to any identifiable user information.</Text>

        <Text style={styles.subheading}>How We Use Your Information</Text>
        <Text style={styles.text}>
          The data you submit is used to:
        </Text>
        <Text style={styles.bullet}>- Share public feedback about transit experiences.</Text>
        <Text style={styles.bullet}>- Provide aggregated, anonymized information to other users about transit wait times.</Text>

        <Text style={styles.subheading}>Public Data</Text>
        <Text style={styles.text}>
          All data submitted through Trash Transit is made public. This includes:
        </Text>
        <Text style={styles.bullet}>- Comments submitted by users.</Text>
        <Text style={styles.bullet}>- Transit wait times reported by users.</Text>
        <Text style={styles.text}>
          By submitting data, you acknowledge that it will be publicly available and accessible to other users of
          the app and potentially external parties.
        </Text>

        <Text style={styles.subheading}>Data Sharing</Text>
        <Text style={styles.text}>
          Trash Transit does not share any additional information with third parties beyond the anonymized,
          publicly available data submitted by users.
        </Text>

        <Text style={styles.subheading}>Data Security</Text>
        <Text style={styles.text}>
          We take reasonable measures to secure the data submitted through the app. However, as all submissions
          are anonymized and made public, users should avoid submitting any sensitive or personal information.
        </Text>

        <Text style={styles.subheading}>Children’s Privacy</Text>
        <Text style={styles.text}>
          Trash Transit is not intended for individuals under the age of 18. We do not knowingly collect any personal
          information from children. If you believe a child has submitted information, please contact us so we can
          take appropriate action.
        </Text>

        <Text style={styles.subheading}>Changes to This Privacy Policy</Text>
        <Text style={styles.text}>
          We may update this Privacy Policy from time to time. Any changes will be effective when we post the
          updated Privacy Policy within the app. Your continued use of the app after any changes indicates your
          acceptance of the updated terms.
        </Text>

        <Text style={styles.subheading}>Contact Us</Text>
        <Text style={styles.text}>
          If you have any questions or concerns about this Privacy Policy, please contact us at:
        </Text>
        <Text style={styles.text}>HBFH Enterprises, LLC</Text>
        <Text style={styles.text}>Email: ktlauer@proton.me</Text>

        <Text style={styles.text}>Thank you for using Trash Transit!</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 20,
  },
  scrollView: {
    // maxHeight: 600,
  },
  contentContainer: {
    paddingVertical: 10,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 22,
  },
  bullet: {
    fontSize: 16,
    marginBottom: 5,
    paddingLeft: 10,
  },
  bold: {
    fontWeight: 'bold',
  },
});

export default PrivacyPolicy;
