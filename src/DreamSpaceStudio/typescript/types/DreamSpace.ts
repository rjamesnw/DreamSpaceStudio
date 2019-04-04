/*
 * DreamsSpaceJS (DreamSpaceJS.com), (c) Inossis.com
 * License: http://creativecommons.org/licenses/by-nc/4.0/
 * License note: While the core OS (server side) is protected, the client side and modules will be open source to allow community
 *               contributions. The aim is to protect the quality of the system, while also allowing the community to build upon it freely.
 *
 * Description: DreamSpace is an Internet-based operating system style environment.  The idea behind it is similar to a web desktop, but without any UI at all.
 *              The DreamSpace API resides on a web server, and allows other web apps to integrate with it, much like any other social API,
 *              such as those provided by Facebook, Twitter, etc. (without any actual web pages).
 *
 *              This file is just a bootstrap to help load the required modules and dependencies.
 *
 * Purpose: To provide a JS framework for .Net DreamSpace and WebDesktop.org, but also for other web applications in a security enhanced and controlled manner.
 *
 * Note: Good performance rules: http://developer.yahoo.com/performance/rules.html
 * Note: Loading benchmark done using "http://www.webpagetest.org/".
 * Note: Reason for factory object construction (new/init) patterns in DreamSpace: http://www.html5rocks.com/en/tutorials/speed/static-mem-pools/
 */

import "../DreamSpaceJS/TSHelpers";
import "../DreamSpaceJS/Globals";

export * from "../DreamSpaceJS/Types";
export * from "../DreamSpaceJS/Utilities";
export * from "../DreamSpaceJS/Globals";
export * from "../DreamSpaceJS/ErrorHandling";
export * from "../DreamSpaceJS/Logging";
export * from "../DreamSpaceJS/Path";
export * from "../DreamSpaceJS/Query";
export * from "../DreamSpaceJS/Resources";
export * from "../DreamSpaceJS/ResourceRequest";
export * from "../DreamSpaceJS/Scripts";
export * from "../DreamSpaceJS/IO";
export * from "../DreamSpaceJS/System/System";
export * from "../DreamSpaceJS/System/PrimitiveTypes";
export * from "../DreamSpaceJS/System/System.Time";
export * from "./Syste./System/Exceptionort * from "./System/System.Diagnostics";
export * from "../DreamSpaceJS/System/System.Events";
export * from "../DreamSpaceJS/System/System.Browser";
export * from "../DreamSpaceJS/System/System.Text";
export * from "../DreamSpaceJS/System/System.Data";
export * from "../DreamSpaceJS/System/System.IO";
export * from "../DreamSpaceJS/System/System.Storage";
