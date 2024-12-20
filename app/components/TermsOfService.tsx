import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const TermsOfService = () => {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.heading}>Terms of Service for Trash Transit</Text>
        <Text style={styles.text}>Effective Date: December 19, 2024</Text>

        <Text style={styles.subheading}>Introduction</Text>
        <Text style={styles.text}>
          Welcome to Trash Transit! By using our app, you agree to comply with these Terms of Service. 
          If you do not agree, please do not use the app. These terms apply to all users of the Trash Transit app, 
          available on iOS and Android platforms.
        </Text>

        <Text style={styles.subheading}>Eligibility</Text>
        <Text style={styles.text}>
          You must be 18 years or older to use Trash Transit. By accessing or using the app, you confirm that you meet this age requirement.
        </Text>

        <Text style={styles.subheading}>Appropriate Use of the App</Text>
        <Text style={styles.text}>
          Users are encouraged to submit comments and transit wait times. However, all submissions must comply with the following rules:
        </Text>
        <Text style={styles.bullet}>- Do not submit profane, offensive, or harmful content.</Text>
        <Text style={styles.bullet}>- Avoid sharing sensitive or personal information.</Text>
        <Text style={styles.bullet}>- Respect other users and the purpose of the app.</Text>
        <Text style={styles.text}>
          Submissions that violate these rules may be removed at our discretion. Repeated violations may result in restricted access to the app.
        </Text>

        <Text style={styles.subheading}>Public Submissions</Text>
        <Text style={styles.text}>
          All data submitted through Trash Transit becomes public and is accessible to all users and potentially external parties. By submitting data, 
          you grant Trash Transit a perpetual, irrevocable license to use, display, and share your submissions.
        </Text>

        <Text style={styles.subheading}>Prohibited Activities</Text>
        <Text style={styles.text}>
          You agree not to:
        </Text>
        <Text style={styles.bullet}>- Submit false, misleading, or inaccurate information.</Text>
        <Text style={styles.bullet}>- Use the app for any unlawful or malicious purpose.</Text>
        <Text style={styles.bullet}>- Engage in any activity that disrupts the functionality of the app or infringes on the rights of others.</Text>

        <Text style={styles.subheading}>Disclaimer of Warranties</Text>
        <Text style={styles.text}>
          Trash Transit is provided on an "as is" and "as available" basis. We do not guarantee the accuracy, completeness, or reliability 
          of the information shared through the app. Use the app at your own risk.
        </Text>

        <Text style={styles.subheading}>Limitation of Liability</Text>
        <Text style={styles.text}>
          To the fullest extent permitted by law, Trash Transit and its operators shall not be held liable for any damages arising 
          from your use of the app or the information shared within it.
        </Text>

        <Text style={styles.subheading}>Changes to Terms of Service</Text>
        <Text style={styles.text}>
          We may update these Terms of Service at any time. Any changes will be effective when we post the updated terms within the app. 
          Continued use of the app after changes indicates your acceptance of the updated terms.
        </Text>

        <Text style={styles.subheading}>Contact Us</Text>
        <Text style={styles.text}>
          If you have any questions or concerns about these Terms of Service, please contact us at:
        </Text>
        <Text style={styles.text}>HBFH Enterprises, LLC</Text>
        <Text style={styles.text}>Email: ktlauer@proton.me</Text>

        <Text style={styles.text}>Thank you for using Trash Transit responsibly!</Text>
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

export default TermsOfService;
