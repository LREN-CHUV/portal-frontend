import React, { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import styled from 'styled-components';
import { APIUser } from '../API';

interface Props extends RouteComponentProps<{}> {
  apiUser: APIUser;
}

const Container = styled.div`
  background-color: white;
  padding: 1em;
  margin: 48px;

  .tos-form {
    margin: 48px;
  }
`;

export default ({ ...props }: Props): JSX.Element => {
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const agreeNDA = props.apiUser.state.user?.agreeNDA;
    if (agreeNDA) {
      props.history.push('/');
    }
  }, [props.apiUser.state, props.history]);

  const handleAcceptTOS = (): void => {
    if (accepted) {
      const { apiUser, history } = props;
      apiUser.acceptTOS().then(() => {
        history.push('/');
      });
    }
  };

  const handleCheckboxChange = (event: React.FormEvent<any>): void => {
    const target = event.target as HTMLInputElement;
    const value = target.checked;
    setAccepted(value);
  };

  return (
    <Container>
      <h1 id="hbp-medical-informatics-platform">
        HBP Medical Informatics Platform
      </h1>
      <h2 id="terms-and-conditions-for-service">
        Terms and Conditions for Service
      </h2>
      <ol>
        <li>
          <p>Ownership and Operation of Website</p>
          <p>
            The Website is owned and operated by the Ecole Polytechnique
            Fédérale de Lausanne, Human Brain Project Coordination Office
            (EPFL-HBPPCO), Switzerland hereinafter described as EPFL-HBPPCO or
            “Service Provider”.
          </p>
        </li>
        <li>
          <p>Scope of the Terms of Service</p>
          <p>
            The following terms and conditions of this Agreement govern all use
            of the collab.humanbrainproject.eu website and all content, services
            and products available at or through the website, including, but not
            limited to, collab.humanbrainproject.eu and
            services.humanbrainproject.eu. The following terms do <em>not</em>{' '}
            apply to services and web based applications offered by
            third-parties through the Collaboratory App extension system.
          </p>
        </li>
      </ol>
      <p>
        <strong>
          Access to this HBP Medical Informatics Platform (&quot;Platform&quot;)
          is provided to you under these terms and conditions for service and
          any amendments or supplements to them (collectively referred to as the
          &quot;Terms &amp; Conditions&quot;) that may be posted on the Platform
          from time to time. Your use of the Platform, or any other services or
          content provided through the Platform, shall be deemed to constitute
          your consent to be legally bound by the Terms &amp; Conditions, which
          shall be enforceable in the same way as if you had signed the Terms
          &amp; Conditions.
        </strong>
      </p>
      <p>
        <em>
          If you do not accept the Terms &amp; Conditions when applying for
          registration or thereafter, when using the Platform, you are not
          permitted to access or use the Platform or to submit or post any
          materials on it.
        </em>
      </p>
      <p>
        Besides the law applicable to these Terms &amp; Conditions, this
        Platform and data available on this Platform are also subject to
        European legislations and regulations as well as to the ethical
        principles of Horizon 2020, the EU Framework programme for research and
        innovation (
        <a href="https://ec.europa.eu/programmes/horizon2020/">
          https://ec.europa.eu/programmes/horizon2020/
        </a>
        ).
      </p>
      <p>
        The Medical Informatics Platform is a privacy preserving platform that
        complies with the European regulation, based on Privacy By Design and by
        Default. The reference text is the REGULATION (EU) 2016/679 OF THE
        EUROPEAN PARLIAMENT AND OF THE COUNCIL of 27 April 2016, on the
        protection of natural persons with regard to the processing of personal
        data and on the free movement of such data, and repealing Directive
        95/46/EC (General Data Protection Regulation) (henceforth ‘GDPR’).
      </p>
      <ol>
        <li>
          <p>Put at Disposal and Operation of Platform</p>
          <p>
            The Platform is put at disposal and operated by the CHUV, Lausanne,
            as the Coordinator of the HBP Sub-Project 8
            (&quot;Coordinator&quot;).
          </p>
        </li>
        <li>
          <p>Scope of the Terms &amp; Conditions</p>
          <p>
            These Terms &amp; Conditions govern all use of the Platform and all
            content, services and products available at or through the Platform.
          </p>
        </li>
        <li>
          <p>Definition of Terms</p>
          <p>
            The following definitions include terms used in European
            legislations and regulations and introduce new ones, specific to
            this Platform.
          </p>
          <ol>
            <li>
              Approved Use means the access to and use of the Platform for
              non-commercial and non-competitive use for any Users’ research
              activities in the field of HBP and approved by the Scientific
              Committee.
            </li>
            <li>Beneficiary means any party to the HBP Agreements.</li>
            <li>
              MIP is the name given to the Medical Informatics Platform
              developed by the HBP.
            </li>
            <li>
              Consortium means the group that consists of all the parties being
              part of the HBP Agreements but does not include the European
              Commission (&quot;EC&quot;)
            </li>
            <li>
              Data Providers. Individuals and/or institutions that produce and
              make available Data Sets on the Platform to the Data Users.
            </li>
            <li>
              Coordinator means the intermediary between the Consortium and the
              EC as stated in the HBP Agreements.
            </li>
            <li>
              Data Set. Digital data, either raw or derived, including but not
              limited to research and scientific data as well as metadata
              provided to the Platform by Data Providers. Data Set may contain
              software and algorithms.
            </li>
            <li>
              Data Subject. A natural or legal person whose personal data (i.e.
              all information relating to an identified or identifiable person)
              is processed.
            </li>
            <li>
              Data User. Individual and/or institution to which access to Data
              Sets on the Platform is granted, subject to the acceptance of the
              Terms &amp; Conditions by such individuals and/or the
              institutions, and which are the Beneficiaries, the EC, EU
              Institutions and other EU bodies as well as the EU Member States.
            </li>
            <li>
              HBP is the Human Brain Project under the FET Integrated Project
              (FP7 Grant Agreement no. 604102, i.e. its ramp-up phase), and any
              following continuation of the project under Horizon 2020.
            </li>
            <li>
              HBP Agreements mean the agreements concluded in respect of the
              HBP, such as FP7 Grant Agreement no. 604102, the Consortium
              Agreement under the FP7 Grant Agreement no. 604102, the Framework
              Partnership Agreement no. 650003, and their subsequent agreements.
            </li>
            <li>
              Personal Data is defined as any information relating to an
              identified or identifiable natural or legal person, including
              institutions. An identifiable person is a person who can be
              identified, directly or indirectly, by reference to an
              identification number or factors specific to his or her physical,
              physiological, mental, economic, cultural or social identity.
              Personal Data does not include publicly available information that
              has not been combined with non- Personal Data, nor does it include
              information that has been anonymized.
            </li>
          </ol>
        </li>
        <li>
          <p>Access to Platform</p>
          <p>
            The Platform intends to provide functionality designed to enable and
            enhance collaboration and team science in the field of the HBP. All
            this research shall, as far as possible, be monitored to ensure the
            ethical use of data and responsible research and innovation with
            active roles for scientists, philosophers, ethicists, policy makers
            and members of society.
          </p>
          <p>
            Access to the Platform is reserved to Data Users for activities
            falling under the Approved Use only. Beneficiaries must also comply
            with the HBP Agreements in their use of the Platform.
          </p>
          <ol>
            <li>
              <p>Login Credentials</p>
              <p>
                When you first register to use the Platform, you will be
                prompted to create a user name and password. You must keep your
                password secret and not give it to anyone else or let them use
                your account. You must inform us immediately if you suspect any
                unauthorized use of or access to your password or account.
              </p>
              <p>
                The Coordinator and the Beneficiaries that participated in the
                specific action related to the Platform will not be responsible
                if you suffer any harm or loss because you do not keep your
                password secret.
              </p>
            </li>
            <li>
              <p>Registration Data and Process</p>
              <p>
                Registration will take place the first time you wish to access
                the Platform. The following registration information is required
                directly or by proxy prior to accessing the Platform:
              </p>
              <ul>
                <li>name</li>
                <li>e-mail address; and</li>
                <li>motivation for using the platform.</li>
              </ul>
            </li>
          </ol>
        </li>
        <li>
          <p>Contributor&#39;s Confirmations and Liabilities</p>
          <p>
            Data Providers confirm that they have signed the Data Sharing
            Agreement and complied with the legal and ethical requirements,
            ensuring the data shared is compliant with all EU and member-state
            regulation and practices.
          </p>
          <p>
            The Coordinator may at its discretion review compliance of the Data
            Providers with these confirmations and liabilities. Non-compliant
            Data Sets may be removed from the Platform.
          </p>
        </li>
        <li>
          <p>Terms on Use</p>
        </li>
        <li>
          <p>Rights of Access and Rights of Use</p>
          <p>
            Use of (including access to) the MIP by the Users is restricted to
            the Approved Use.
          </p>
          <p>
            Data Sets are provided for use by the Data Users only. Any rights to
            sub-license are excluded, if not expressly agreed with the
            Contributor.
          </p>
          <p>
            The Data User is permitted to produce and distribute derived works
            from Data Sets provided that those derivatives are released for the
            Approved Use. Any other uses for the Data Sets or its derived
            products will require explicit permission from the Contributor.
          </p>
          <p>
            Software and algorithms contained in Data Sets are made available
            pursuant to the terms of their respective license agreements. For a
            use outside the HBP, a Contributor may require that the Data Sets
            are subject to licensing and/or must be kept confidential as
            provided for by these Terms &amp; Conditions. This requirement must
            be expressly indicated in each Data Set. In such a case, licensing
            terms will be directly agreed between the Contributor and the
            involved Data Users.
          </p>
        </li>
        <li>
          <p>Other Limitations of Use</p>
          <p>
            The following additional limitations apply to the use of the Data
            Sets by the Data Users:
          </p>
          <ol>
            <li>
              Data Users may receive access to de-identified or aggregated Data
              Sets and in such cases, they will not attempt to establish the
              identity of, or attempt to contact any of the Data Subjects;
            </li>
            <li>
              Data Users may not carry out any calculations, operations or
              transactions that may interrupt, destroy or restrict the
              functionality of the operation of the Platform or of any program,
              computer or means of telecommunications;
            </li>
            <li>
              Data Users may not use the Data Sets for high risk activities such
              as the operation of nuclear facilities, air traffic control, or
              life support systems, where the use or failure of the Services
              could lead to death, personal injury, or environmental damage.
            </li>
            <li>
              Data Users commit to require from anyone of their team who
              utilizes the Data Sets, or anyone with whom they share the Data
              Sets, to accept and comply with these Terms &amp; Conditions; and
            </li>
            <li>
              Data Users commit to comply with any additional rules and
              regulations imposed by their institutions and their institutional
              review board in accessing and using the Data Sets.
            </li>
          </ol>
        </li>
        <li>
          <p>Citations</p>
          <p>
            Each Data User agrees to properly cite the Data Sets, including the
            Data Set Identifier, in any publications or in the metadata of any
            derived data products that are produced using the Data Sets.
          </p>
          <p>
            Citations shall take the following general form: Creator, Year of
            Data Set Publication, Title of Data Set, Data Set Identifier. Where
            a paper on the Data Set of its Contributor is available, then this
            should be cited. Where a date of issue of the Data Set is available,
            this date should be cited.
          </p>
        </li>
        <li>
          <p>Acknowledgements</p>
          <p>
            Data Users agree to include the following acknowledgment in any of
            their disseminations and publications, where the Data Sets
            contributed significantly to their content:
          </p>
          <p>
            &quot;Data in this publication were provided by the HBP and/or
            received from services operated by the HBP. This project/research
            received funding from the European Union’s Horizon 2020 Framework
            Programme for Research and Innovation under the Framework
            Partnership Agreement No. 650003 (HBP FPA and corresponding Specific
            Grant Agreement number).&quot;_
          </p>
          <p>
            In addition, Data Users agree to include any additional
            acknowledgment of institutional support or specific funding awards
            provided in the metadata accompanying any Data Set, including those
            requested by the Contributor, in any dissemination where the Data
            Set contributes significantly to its content.
          </p>
        </li>
        <li>
          <p>Report of Misuse</p>
          <p>
            Any and all Data Users commit to report any use or disclosure of the
            Data Sets non-compliant with these Terms &amp; Conditions of which
            they become aware as soon as possible, but at the latest within 15
            days of becoming aware of such use or disclosure.
          </p>
          <p>
            Reports/disclosures should be submitted to the HBP Point of
            Registration at:{' '}
            <a href="https://www.hbp-pore.eu">https://www.hbp-pore.eu</a>.
          </p>
          <p>Non-compliant Data Sets may be removed from the Platform.</p>
        </li>
      </ol>
      <h1 id="general-data-protection-regulation">
        General Data Protection Regulation
      </h1>
      <ol>
        <li>
          <p>Personal Data Policy</p>
          <p>
            The following privacy rules apply to any form of processing
            (including but not limited to collection, use and disclosure) of
            Personal Data through the Platform.
          </p>
          <p>
            This Personal Data Policy applies exclusively to this Platform and
            hence not to any other website the Platform refers to.
          </p>
        </li>
        <li>
          <p>Passive Collection of Personal Data</p>
          <p>
            While you use the Platform, Personal Data may be recorded passively
            (i.e. without you actively providing them to us), e.g. through use
            of your Internet Protocol (&quot;IP&quot;) addresses and cookies
            (&quot;Passive Collection&quot;).
          </p>
          <ul>
            <li>Internet Protocol</li>
          </ul>
          <p>
            An IP address is a number which is allocated to your device by your
            internet service provider in order to enable you to access the
            Internet. Data is saved automatically when you browse the Platform,
            whereby it is possible that information indirectly related to your
            person is collected and combined with your person.
          </p>
          <p>
            This information is used to enhance your experience in using the
            Platform and is not shared with external parties except as
            aggregated statistics. In the case of aggregated statistics, no
            personal information or behavioral data is visible.
          </p>
          <ul>
            <li>Cookies</li>
          </ul>
          <p>
            To make this site work properly, we sometimes place small data files
            called cookies on your device.
          </p>
          <p>
            A cookie is a small text file that the Platform saves on your device
            when you visit the Platform. It enables the Platform to remember
            your actions and preferences (such as login, language, font size and
            other display preferences) over a period of time, so you do not have
            to keep re-entering them whenever you come back to the Platform.
          </p>
          <p>We may use cookies to remember:</p>
          <ul>
            <li>
              if you have agreed (or not) to our use of cookies on the Platform;
              and
            </li>
            <li>
              your display preferences, such as contrast color settings or font
              size.
            </li>
          </ul>
          <p>
            Furthermore, please note that we use Google Analytics to monitor the
            traffic to our website. For more information read the Google
            Analytics policy (cf.{' '}
            <a href="https://support.google.com/analytics/answer/6004245">
              https://support.google.com/analytics/answer/6004245
            </a>
            ).
          </p>
          <p>
            Enabling these cookies is not strictly necessary for the Platform to
            work but it will provide you with a better browsing experience. You
            can delete or block these cookies, but if you do that some features
            of the Platform may not work as intended.
          </p>
          <p>
            The cookie-related information is not used to identify you
            personally. These cookies are not used for any purpose other than
            those described here.
          </p>
          <p>
            You can control and/or delete cookies as you wish. For details, see
            www.aboutcookies.org. You can delete all cookies that are already on
            your device and you can set most browsers to prevent them from being
            placed. If you do this, however, you may have to manually adjust
            some preferences every time you visit the Platform and some services
            and functionalities may not work.
          </p>
        </li>
        <li>
          <p>Control on Personal Data</p>
          <p>
            You will always be able to check any of your Personal Data. This
            means that you can always (i) obtain information about your Personal
            Data on the Platform; (ii) request us to correct or update your
            Personal Data and (iii) request us to delete or block your Personal
            Data.
          </p>
          <p>
            Where we disclose Personal Data to domestic or international service
            providers (commissioned data processing) for the purpose of
            maintenance of the Platform, the service providers are not deemed
            third parties and are bound by contract to comply with Swiss Data
            Protection law and this Personal Data Policy.
          </p>
          <p>
            We will take appropriate measures to protect Personal Data from
            loss, misuse and unauthorized access, unauthorized disclosure,
            changes, deletion or destruction. Nevertheless, please note that the
            Internet and with that the Platform is never entirely secure or
            error-free. When sending your Personal Data electronically via the
            Platform, a secured internet connection (SSL) will be used for the
            transmission to your device. It is, however, your responsibility to
            take corresponding safeguard measures in the use of password etc.
          </p>
        </li>
        <li>
          <p>Copyright</p>
          <p>
            The content, organization, graphics, design, compilation, magnetic
            translation, digital conversion and other matters related to the
            Platform are protected under applicable copyrights, trademarks and
            other proprietary (including but not limited to intellectual
            property) rights.
          </p>
          <p>
            Subject to statutory allowances, extracts of material from the site
            may be accessed, downloaded and printed for your personal and
            non-commercial use within the Approved Use only.
          </p>
        </li>
        <li>
          <p>Confidentiality</p>
          <p>
            Data Sets uploaded to the Platform are considered non-confidential
            in all cases.
          </p>
        </li>
        <li>
          <p>Termination and Liability</p>
          <p>
            The Coordinator shall have the right to terminate access and use of
            the Data Sets immediately by written notice upon the Data User&#39;s
            breach of, or non-compliance with, any of the terms of the Terms
            &amp; Conditions.
          </p>
          <p>
            The Data User may be held entirely responsible for any misuse that
            was caused or encouraged by the Data User&#39;s failure to abide by
            the Terms &amp; Conditions. Consequences from failure to abide by
            the Terms &amp; Conditions may include legal proceedings.
          </p>
        </li>
        <li>
          <p>Disclaimer</p>
          <p>
            The Data Sets, and any part thereof, as well as the Platform are
            provided for the Approved Use only.
          </p>
          <p>
            The Platform and the Data Sets are provided on an &quot;as is&quot;
            and &quot;as available&quot; basis. Please note that the Platform
            and the Data Sets may contain bugs, viruses, errors, problems or
            other limitations. To the extent permitted by law, the Coordinator
            and the Beneficiaries that participated in the specific action
            related to the Platform exclude any warranties (whether expressed or
            implied) for the Platform and the Data Sets. This includes, but is
            not limited to the disclaimer of any implied warranties of
            merchantability and fitness for a particular purpose of the Platform
            or of any Data Set.
          </p>
          <p>
            Data Sets may contain advice, opinions, statements or other
            information by various authors or entities. Reliance upon any such
            advice, opinion, statement or other information is at your own risk.
          </p>
          <p>
            The Coordinator and the Beneficiaries that participated in the
            specific action related to the Platform disclaims, to the extent
            permitted by law, all liability and responsibility arising from any
            use of the Platform or the Data Sets. In particular, but not as a
            limitation thereof, the Coordinator is and the Beneficiaries that
            participated in the specific action related to the Platform are not
            liable for any damages (including damages for loss of business, loss
            of profits, litigation, or the like), whether based on breach of
            contract, breach of warranty, tort (including negligence), product
            liability or otherwise, even if advised of the possibility of such
            damages. The acknowledgment of exclusion of liability is an
            essential condition for the Coordinator and the Beneficiaries that
            participated in the specific action related to the Platform granting
            access to the Platform and to the Data Sets. This Platform and its
            services and/or information are provided to Data Users with these
            limitations only.
          </p>
          <p>
            The Coordinator reserves the right to discontinue at any time,
            temporarily or permanently, your ability to access the Platform as
            well as to upload Data Sets and/or access them with or without
            notice, at its sole discretion and for any reason whatsoever.
          </p>
        </li>
        <li>
          <p>Applicable Law and Jurisdiction</p>
          <p>
            The substantive laws of Switzerland, excluding any conflict of law
            rules, shall apply to any dispute arising out of the access and use
            of the Platform and of the Data Sets pursuant to these Terms &amp;
            Conditions. The ordinary courts of Lausanne, Switzerland, shall have
            exclusive jurisdiction, subject to appeal, if any.
          </p>
          <p>
            Law and jurisdiction applicable to the Data Providers, the Data
            Users and the Beneficiaries pursuant to the HBP Agreements are
            expressly reserved.
          </p>
        </li>
        <li>
          <p>Contact Us</p>
          <p>
            In case you have any queries, comments or concerns about these Terms
            &amp; Conditions, please contact: platform@humanbrainproject.eu
          </p>
        </li>
      </ol>
      <div className="tos-form">
        <Form.Check
          inline={true}
          type="checkbox"
          id={`tos`}
          label={'I accept the HBP Medical Informatics Platform Terms of Use.'}
          onChange={handleCheckboxChange}
        ></Form.Check>

        <Button
          onClick={handleAcceptTOS}
          disabled={!accepted}
          variant="primary"
          type="submit"
        >
          Proceed
        </Button>
      </div>
    </Container>
  );
};
