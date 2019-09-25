import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  background-color: white;
  padding: 1em;
  margin: 0 48px;
`;

export default (): JSX.Element => (
  <Container>
    <h1>HBP Medical Informatics Platform</h1>
    <h2>Terms and Conditions for Service</h2>
    <ol>
      <li>Ownership and Operation of Website</li>
      <ol>
        <li>
          The Website is owned and operated by the Ecole Polytechnique Fédérale
          de Lausanne, Human Brain Project Coordination Office (EPFL-HBPPCO),
          Switzerland hereinafter described as EPFL-HBPPCO or “Service
          Provider”.
        </li>
      </ol>
      <li>Scope of the Terms of Service</li>
      <ol>
        <li>
          The following terms and conditions of this Agreement govern all use of
          the collab.humanbrainproject.eu website and all content, services and
          products available at or through the website, including, but not
          limited to, collab.humanbrainproject.eu and
          services.humanbrainproject.eu.
        </li>
        <li>
          The following terms do *not* apply to services and web based
          applications offered by third-parties through the Collaboratory App
          extension system.
        </li>
      </ol>
      <li>
        Access to this HBP Medical Informatics Platform (&quot;Platform&quot;)
        is provided to you under these terms and conditions for service and any
        amendments or supplements to them (collectively referred to as the
        &quot;Terms &amp; Conditions&quot;) that may be posted on the Platform
        from time to time. Your use of the Platform, or any other services or
        content provided through the Platform, shall be deemed to constitute
        your consent to be legally bound by the Terms &amp; Conditions, which
        shall be enforceable in the same way as if you had signed the Terms
        &amp; Conditions.
      </li>
      <li>
        If you do not accept the Terms &amp; Conditions when applying for
        registration or thereafter, when using the Platform, you are not
        permitted to access or use the Platform or to submit or post any
        materials on it.
      </li>
      <li>
        Besides the law applicable to these Terms &amp; Conditions, this
        Platform and data available on this Platform are also subject to
        European legislations and regulations as well as to the ethical
        principles of Horizon 2020, the EU Framework programme for research and
        innovation (
        <a href="https://ec.europa.eu/%20programmes/horizon2020/">
          https://ec.europa.eu/ programmes/horizon2020/
        </a>
        ).
      </li>
      <li>
        The Medical Informatics Platform is a privacy preserving platform that
        complies with the European regulation, based on Privacy By Design and by
        Default. The reference text is the REGULATION (EU) 2016/679 OF THE
        EUROPEAN PARLIAMENT AND OF THE COUNCIL of 27 April 2016, on the
        protection of natural persons with regard to the processing of personal
        data and on the free movement of such data, and repealing Directive
        95/46/EC (General Data Protection Regulation) (henceforth ‘GDPR’).
      </li>
    </ol>
    <ol>
      <li>Put at Disposal and Operation of Platform</li>
      <ol>
        <li>
          The Platform is put at disposal and operated by the CHUV, Lausanne, as
          the Coordinator of the HBP Sub-Project 8 Coordinator.
        </li>
      </ol>
    </ol>
  </Container>
);
